import { render } from './dom'
import { defer, timer } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'

export const selfie = (ws: WebSocket) => {
  const w = 1280 / 2
  const h = 720 / 2
  render(
    `<video id="vid" autoplay style="background-color:black;width:100vw;height:100vh"></video>`
  )
  const video = document.getElementById('vid')! as HTMLVideoElement

  const getFrame = () => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    const data = canvas.toDataURL('image/png')
    return data
  }

  return defer(() =>
    navigator.mediaDevices
      .getUserMedia({ video: { width: w, height: h } })
      .then(stream => (video.srcObject = stream))
  ).pipe(
    switchMap(() => timer(0, 1000 / 8)),
    tap(() =>
      ws.send(
        JSON.stringify({
          type: 'img',
          payload: getFrame()
        })
      )
    )
  )
}
