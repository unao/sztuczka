import { defer, timer } from 'rxjs'
import { switchMap, map, tap, finalize } from 'rxjs/operators'

export const selfie = (video: HTMLVideoElement) => {
  const w = 1280 / 2
  const h = 720 / 2

  const getFrame = () => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    const data = canvas.toDataURL('image/png')
    return data
  }

  return defer(() =>
    navigator.mediaDevices.getUserMedia({ video: { width: w, height: h } })
  ).pipe(
    tap(s => (video.srcObject = s)),
    switchMap(stream =>
      timer(0, 1000 / 8).pipe(
        map(() => getFrame()),
        finalize(() => stream.getTracks().forEach(t => t.stop()))
      )
    )
  )
}
