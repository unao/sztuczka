import {
  connectWS,
  tap,
  fullscreen,
  retryWhen,
  delay,
  switchMap,
  ProtocolHandler,
  mergeMap,
  playAudio,
  takeUntil,
  filter,
  take
} from 'common'
import * as play from '../assets/parsed.json'
import { merge, Observable, timer } from 'rxjs'
import { run } from './phone'
import { smsUI } from './ui'
import { Observer } from 'firebase'

const txt = play['AKT I'].scenes.concat(play['AKT II'].scenes)
const plot = txt.reduce((acc, t) => acc.concat(t.plot), [] as Array<{
  type: string
  who?: string
  what: string
  id: string
}>)

const l = plot.length
const progress = plot.reduce(
  (acc, n, idx) => {
    acc[n.id] = idx / l
    return acc
  },
  {} as { [K in string]: number }
)

document.body.innerHTML = `<div style="background-color:black;width:100vw;">
  <video src="/assets/eclipse.mp4" style="width:100vw;height:100vh"></video>
  <button id="fullscreen" style="z-index:10;position:absolute;top:0;left:0">fullscreen</button>
  <img style="display:none;z-index:2;position:absolute;top:0;left:0;width:100vw;height:100vh"></img>
</div>`

document.getElementById('fullscreen')!.onclick = () =>
  document.body.requestFullscreen()
document.body.onfullscreenchange = () =>
  (document.getElementById(
    'fullscreen'
  )!.style.display = document.fullscreenElement ? 'none' : 'block')

const vid = document.getElementsByTagName('video')[0]
const img = document.getElementsByTagName('img')[0]

const handle: ProtocolHandler = all => ({
  txt: ms => ms.pipe(tap(m => (vid.currentTime = progress[m] * vid.duration))),
  img: ms =>
    ms.pipe(
      tap(m => {
        img.style.display = 'block'
        img.src = m.url
      }),
      switchMap(m =>
        timer(m.duration).pipe(tap(() => (img.style.display = 'none')))
      )
    ),
  audioStart: ms =>
    ms.pipe(
      mergeMap(m =>
        playAudio(m.url, false).pipe(
          takeUntil(all.pipe(filter(a => a.type === 'audioStop')))
        )
      )
    ),
  callGet: ms =>
    ms.pipe(
      mergeMap(m =>
        playAudio(`call/${m.who!}.mp3`, false).pipe(
          takeUntil(all.pipe(filter(a => a.type === 'callStart')))
        )
      )
    ),
  msgShow: ms =>
    ms.pipe(
      mergeMap(m =>
        Observable.create((obs: Observer<HTMLDivElement>) => {
          console.log(m)
          const div = document.createElement('div')
          document.body.append(div)
          div.innerHTML = smsUI(m.other || m.number, m.body, m.who)
          obs.next(div.children[0]! as any)
          return () => div.remove()
        }).pipe(
          delay(5000),
          tap((d: HTMLDivElement) =>
            Object.assign(d.style, {
              opacity: '0',
              filter: 'blur(25px)'
            })
          ),
          delay(1000),
          take(1)
        )
      )
    )
})

connectWS('screen')
  .pipe(
    switchMap(ws =>
      merge(
        run(document.body.children[0] as HTMLDivElement, ws.handle),
        ws.handle(handle)
      )
    ),
    retryWhen(errs =>
      errs.pipe(
        tap(err => console.warn(err)),
        delay(250)
      )
    )
  )
  .subscribe()
