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
  retryWhen
} from 'rxjs/operators'

Object.assign(document.body.style, { margin: 0, overflow: 'hidden' })

document.body.innerHTML = '<div style="background-color:white"></div>'
const c = document.body.firstElementChild as HTMLDivElement

export const fullscreen = () => c.requestFullscreen()

export const render = (content: string) => (c.innerHTML = content)

export const playAudio = (name: string) =>
  Observable.create((obs: Observer<any>) => {
    const el = document.createElement('audio')
    el.src = `/assets/${name}`
    document.body.appendChild(el)
    el.play().catch(e => obs.error(e))
    el.onended = () => obs.complete()
    obs.next(el)
    return () => {
      console.log('CLEAN-UP', name)
      el.pause()
      el.remove()
    }
  })

export const recordAudio = (stop: Observable<unknown>, prefix: string) =>
  defer(() =>
    navigator.mediaDevices.getUserMedia({
      audio: true
    })
  )
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
              stream.getTracks().forEach(t => t.stop())
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
        return defer(() => of(audio.duration)).pipe(
          mergeMap(() =>
            audio.duration === Infinity || !audio.duration
              ? throwError('')
              : of(true)
          ),
          retryWhen(errs => errs.pipe(delay(50))),
          map(() => ({
            audio,
            duration: audio.duration,
            file: new File([file], `${prefix}_${audio.duration * 1000}.webm`, {
              lastModified: Date.now()
            })
          }))
        )
      })
    )
