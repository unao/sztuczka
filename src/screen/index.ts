import {
  connectWS,
  tap,
  retryWhen,
  delay,
  switchMap,
  ProtocolHandler,
  playAudio,
  takeUntil,
  filter,
  map,
  repeat
} from 'common'
import * as play from '../assets/parsed.json'
import { merge, timer, of } from 'rxjs'
import { phone } from './phone'
import { content } from './messages'

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
  <img style="display:none;z-index:2;position:absolute;top:0;left:0;width:75vh;height:100vh"></img>
</div>`

document.getElementById('fullscreen')!.onclick = () =>
  document.body.requestFullscreen()
document.body.onfullscreenchange = () =>
  (document.getElementById(
    'fullscreen'
  )!.style.display = document.fullscreenElement ? 'none' : 'block')

// const vid = document.getElementsByTagName('video')[0]
const img = document.getElementsByTagName('img')[0]

const handle: ProtocolHandler = all => ({
  txt: ms =>
    of(Array.from(document.getElementsByTagName('video'))).pipe(
      switchMap(vs =>
        ms.pipe(
          map(m => (0.4 + 0.6 * progress[m]) * vs[0].duration),
          tap((t: number) => vs.forEach(v => (v.currentTime = t)))
        )
      )
    ),
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
      switchMap(m =>
        playAudio(m.url, { vibrate: false }).pipe(
          takeUntil(all.pipe(filter(a => a.type === 'audioStop')))
        )
      )
    ),
  callGet: ms =>
    ms.pipe(
      switchMap(m =>
        playAudio(`call/${m.who!}.mp3`, {
          vibrate: false,
          smoothStart: 2000,
          smoothEnd: 0
        }).pipe(
          repeat(),
          takeUntil(
            all.pipe(
              filter(a => a.type === 'callStart' || a.type === 'callEnd')
            )
          )
        )
      )
    )
})

connectWS('screen')
  .pipe(
    switchMap(ws =>
      merge(
        phone(document.body.children[0] as HTMLDivElement, ws.handle),
        content(document.body.children[0] as HTMLDivElement, ws.handle),
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
