import {
  Observable,
  Observer,
  defer,
  of,
  Subject,
  merge,
  throwError
} from 'rxjs'
import {
  mergeMap,
  takeUntil,
  switchMap,
  map,
  delay,
  retryWhen,
  tap,
  take
} from 'rxjs/operators'
import { recId } from './names'

Object.assign(document.body.style, { margin: 0, overflow: 'hidden' })

document.body.innerHTML = '<div style="background-color:white"></div>'
const c = document.body.firstElementChild as HTMLDivElement
window.onbeforeunload = () => window.scrollTo(0, 0)

export const fullscreen = () => c.requestFullscreen()

export const render = (content: string) => (c.innerHTML = content)

export const playAudio = (name: string) =>
  Observable.create((obs: Observer<any>) => {
    const el = document.createElement('audio')
    el.src = name.startsWith('https') ? name : `/assets/${name}`
    document.body.appendChild(el)
    el.play().catch(e => {
      obs.error(e)
    })
    el.onended = () => obs.complete()
    obs.next(el)
    return () => {
      el.pause()
      el.remove()
    }
  })

export const recordAudio = (
  stream: MediaStream,
  stop: Observable<unknown>,
  prefix: string
) =>
  of(stream) // TODO - simplify
    .pipe(
      mergeMap(stream => {
        const sub = new Subject<Blob>()
        return merge(
          Observable.create(() => {
            const recorder = new MediaRecorder(stream, {
              mimeType: 'audio/webm'
            })
            recorder.ondataavailable = e => sub.next(e.data)
            recorder.start()
            return () => {
              recorder.stop()
            }
          }).pipe(takeUntil(stop)),
          sub
        ) as Observable<Blob> // tslint:disable-line
      })
    )
    .pipe(
      switchMap(file => {
        const u = URL.createObjectURL(file)
        const audio = document.createElement('audio')
        audio.src = u
        document.body.append(audio)
        // https://stackoverflow.com/questions/21522036/html-audio-tag-duration-always-infinity
        audio.currentTime = 9999999999
        audio.play()
        return defer(() => of(audio.duration)).pipe(
          mergeMap(() =>
            audio.duration === Infinity || !audio.duration
              ? throwError({ message: 'AUDIO_DURATION' })
              : of(true)
          ),
          retryWhen(errs =>
            errs.pipe(
              take(10),
              tap(() => audio.play()),
              delay(50)
            )
          ),
          tap(() => {
            audio.pause()
            audio.currentTime = 0
          }),
          map(() => ({
            audio,
            duration: audio.duration,
            file: new File(
              [file],
              `${recId(Date.now(), prefix, audio.duration * 1000)}.webm`,
              {
                lastModified: Date.now()
              }
            )
          }))
        )
      })
    )
