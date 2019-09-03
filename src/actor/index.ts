import { connectWS, retry, repeat, tap, switchMap } from '../common'
import { fromEvent } from 'rxjs'

console.log('actor')
document.body.innerHTML = `<h1>${window.innerWidth}x${window.innerHeight}</h1>
<button id="vib">vib</button>
<div id="orient">WTF?</div>
<div id="mo"></div>
`

connectWS()
  .pipe(
    tap(ws => console.log('CONNECTED', ws)),
    retry(),
    repeat()
  )
  .subscribe()

fromEvent(document.getElementById('vib')!, 'click')
  .pipe(tap(() => navigator.vibrate(2000)))
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

// fromEvent<DeviceMotionEvent>(window, 'devicemotion')
//   .pipe(
//     tap(
//       mo =>
//         (document.getElementById('mo')!.innerText = `
//           ${Math.round(mo.acceleration!.x!)} ${Math.round(
//           mo.acceleration!.y!
//         )} ${Math.round(mo.acceleration!.z!)}`)
//     )
//   )
//   .subscribe()

setTimeout(() => navigator.vibrate(2000), 10000)
