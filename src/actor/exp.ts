import { connectWS, retry, repeat, tap, switchMap, retryWhen } from '../common'
import { fromEvent } from 'rxjs'

console.log('actor')
document.body.innerHTML = `
<button id="vib">vib</button>
<video id="vid" autoplay style="width:100vw;height=100vh;"></video>
<div style="height:2000px"></div>
`


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
