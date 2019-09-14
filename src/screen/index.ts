import { connectWS, tap, fullscreen, retryWhen, delay } from 'common'

document.body.innerHTML = `<div style="background-color:black;width:100vw;">
  <video autoplay loop src="/assets/eclipse.mp4" style="width:100vw;height:100vh"></video>
  <img style="display:none;z-index:1;position:absolute;top:0;left:0;width:100vw;height:100vh"></img>
</div>`

const vid = document.getElementsByTagName('video')[0]
const img = document.getElementsByTagName('img')[0]
vid.playbackRate = 0.07
// vid.play()

connectWS('screen')
  .pipe(
    tap(ws => {
      // fullscreen()
      ws.onmessage = e => {
        // const m = JSON.parse(e.data)
        // img.style.display = m.payload ? 'block' : 'none'
        // img.src = m.payload
      }
    }),
    retryWhen(errs =>
      errs.pipe(
        tap(err => console.warn(err)),
        delay(250)
      )
    )
  )
  .subscribe()
