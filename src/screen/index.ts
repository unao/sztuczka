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
  <img style="display:none;z-index:1;position:absolute;top:0;left:0;width:100vw;height:100vh"></img>
</div>`

const vid = document.getElementsByTagName('video')[0]
const img = document.getElementsByTagName('img')[0]
// vid.playbackRate = 0.07
// vid.play()

const handle: ProtocolHandler = all => ({
  txt: ms => ms.pipe(tap(m => (vid.currentTime = progress[m] * vid.duration)))
})

connectWS('screen')
  .pipe(
    switchMap(
      ws => ws.handle(handle)
      // fullscreen()
      // ws.onmessage = e => {
      // const m = JSON.parse(e.data)
      // img.style.display = m.payload ? 'block' : 'none'
      // img.src = m.payload
      // }
    ),
    retryWhen(errs =>
      errs.pipe(
        tap(err => console.warn(err)),
        delay(250)
      )
    )
  )
  .subscribe()
