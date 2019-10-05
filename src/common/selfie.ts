import { defer, timer, animationFrameScheduler } from 'rxjs'
import { switchMap, map, tap, finalize } from 'rxjs/operators'

export const selfie = (video: HTMLVideoElement) => {
  const w = 1280 / 4
  const h = 720 / 4

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
    tap(() => video.play()),
    switchMap(stream =>
      timer(0, 1, animationFrameScheduler).pipe(
        map(() => getFrame()),
        finalize(() => stream.getTracks().forEach(t => t.stop()))
      )
    )
  )
}
