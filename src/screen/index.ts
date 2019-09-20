import {
  connectWS,
  tap,
  fullscreen,
  retryWhen,
  delay,
  switchMap,
  ProtocolHandler
} from 'common'
import * as play from '../assets/parsed.json'
import { smsUI } from './message'

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
  ${smsUI('Darek', 'Dupek!')}
  <video src="/assets/eclipse.mp4" style="width:100vw;height:100vh"></video>
  <button id="fullscreen" style="z-index:2;position:absolute;top:0;left:0">fullscreen</button>
  <img style="display:none;z-index:1;position:absolute;top:0;left:0;width:100vw;height:100vh"></img>
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
  txt: ms => ms.pipe(tap(m => (vid.currentTime = progress[m] * vid.duration)))
})

connectWS('screen')
  .pipe(
    switchMap(ws => ws.handle(handle)),
    retryWhen(errs =>
      errs.pipe(
        tap(err => console.warn(err)),
        delay(250)
      )
    )
  )
  .subscribe()
