import { connectWS, retry, repeat, tap, switchMap, retryWhen } from '../common'
import { fromEvent } from 'rxjs'

console.log('actor')
document.body.innerHTML = `<h1>${window.innerWidth}x${window.innerHeight}</h1>
<button id="vib">vib</button>
<div id="orient">WTF?</div>
<div id="mo"></div>
<video id="vid" autoplay style="width:100%;"></video>
<div style="height:2000px"></div>
`

connectWS()
  .pipe(
    tap(ws => console.log('CONNECTED', ws)),
    retryWhen(es => es.pipe(tap(e => alert(e))))
  )
  .subscribe()

fromEvent(document.getElementById('vib')!, 'click')
  .pipe(
    tap(() => navigator.vibrate(2000)),
    tap(() => document.body.requestFullscreen())
  )
  .subscribe()

fromEvent<DeviceOrientationEvent>(window, 'deviceorientation')
  .pipe(
    tap(
      orient =>
        (document.getElementById('orient')!.innerText = `${Math.round(
          orient.beta || 0
        )}`)
    )
  )
  .subscribe()

const constraints = {
  video: true
  //  audio: true
}

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(
      s => ((document.getElementById('vid')! as HTMLVideoElement).srcObject = s)
    )
    .catch(e => alert(e))
} else {
  alert('Your browser does not support getUserMedia API')
}

// ;(document.getElementById('vid')! as HTMLVideoElement)
//   .requestFullscreen()
//   .catch(err => alert(err.message))
// document.fullscreenElement()
