import { Observable, Observer, defer, of, Subject, merge } from 'rxjs'
import { mergeMap, takeUntil } from 'rxjs/operators'

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

export const recordAudio = (stop: Observable<unknown>, name: string) =>
  defer(() =>
    navigator.mediaDevices.getUserMedia({
      audio: true
    })
  ).pipe(
    mergeMap(stream => {
      const sub = new Subject<File>()
      const start = Date.now()
      return merge(
        Observable.create(() => {
          const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
          recorder.ondataavailable = e =>
            sub.next(
              new File([e.data], `${name}-${Date.now() - start}.webm`, {
                lastModified: Date.now()
              })
            )
          recorder.start()
          return () => {
            stream.getTracks().forEach(t => t.stop())
            recorder.stop()
          }
        }).pipe(takeUntil(stop)),
        sub.asObservable()
      )
    })
  ) as Observable<File>
