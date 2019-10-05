import {
  Observable,
  Observer,
  timer,
  animationFrameScheduler,
  EMPTY,
  merge,
  of
} from 'rxjs'
import { loadFont } from './load-font'
import { takeWhile, map, tap, switchMap, finalize } from 'rxjs/operators'
import { getAudioConfig } from './audio-config'

Object.assign(document.body.style, { margin: 0, overflow: 'hidden' })

document.body.innerHTML = '<div style="background-color:white"></div>'
const c = document.body.firstElementChild as HTMLDivElement
window.onbeforeunload = () => window.scrollTo(0, 0)
loadFont()

export const fullscreen = () => document.documentElement.requestFullscreen()

export const render = (content: string) => (c.innerHTML = content)

let pattern: number[] = []
for (let i = 0; i < 30; i++) {
  pattern.push(1000)
  pattern.push(1000)
}

export const smoothVolume = (
  el: HTMLAudioElement,
  op: {
    to: number
    duration: number
  }
) => {
  const start = Date.now()
  const from = el.volume
  return timer(0, 1, animationFrameScheduler).pipe(
    map(() => (Date.now() - start) / op.duration),
    takeWhile(progress => progress < 1),
    map(p => 0.5 - Math.cos(p * Math.PI) / 2),
    map(p => from + p * (op.to - from)),
    map(v => Math.min(1, Math.max(0, v))),
    tap(x => (el.volume = x)),
    finalize(() => (el.volume = op.to))
  )
}

export const playAudio = (
  name: string,
  options?: {
    vibrate?: boolean
    smoothStart?: number
    smoothEnd?: number
  }
): Observable<HTMLAudioElement> => {
  const cfg = getAudioConfig(name)
  const op = Object.assign(
    {
      vibrate: true,
      smoothStart: 0,
      smoothEnd: 0
    },
    options || {},
    cfg
  )
  return Observable.create((obs: Observer<any>) => {
    const el = document.createElement('audio')
    el.src = name.startsWith('https') ? name : `/assets/${name}`
    document.body.appendChild(el)
    el.volume = 0
    el.play().catch(e => {
      obs.error(e)
    })
    el.onended = () => obs.complete()
    obs.next(el)
    op.vibrate && navigator.vibrate(pattern)
    return () => {
      op.vibrate && navigator.vibrate(0)
      smoothVolume(el, { to: 0, duration: op.smoothEnd })
        .pipe(
          finalize(() => {
            el.pause()
            el.remove()
          })
        )
        .subscribe()
    }
  }).pipe(
    switchMap((el: HTMLAudioElement) =>
      merge(
        of(el),
        smoothVolume(el, { to: 1, duration: op.smoothStart }).pipe(
          switchMap(() => EMPTY)
        ),
        ((cfg && cfg!.custom(el)) || EMPTY).pipe(switchMap(() => EMPTY))
      )
    )
  )
}
