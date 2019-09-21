import { init } from './init'
import {
  retryWhen,
  delay,
  switchMap,
  ProtocolHandler,
  tap,
  Actor,
  playAudio,
  takeUntil,
  filter,
  selfie,
  map,
  finalize
} from 'common'
import { setCurrent } from './text'

const handle = (a: Actor): ProtocolHandler => all => ({
  txt: ms => ms.pipe(tap(setCurrent)),
  msgGet: ms =>
    ms.pipe(switchMap(m => playAudio(`${m.kind}/${a}${m.variant || ''}.mp3`))),
  callGet: ms =>
    ms.pipe(
      switchMap(c =>
        playAudio(`call/${a}.mp3`).pipe(
          takeUntil(all.pipe(filter(x => x.type === 'callStart')))
        )
      )
    ),
  selfieStart: ms =>
    ms.pipe(
      map(() => {
        document.body.insertAdjacentHTML(
          'beforeend',
          `<video id="selfie" autoplay style="z-index:1;position:fixed;top:0;left:0;background-color:black;width:100vw;height:100vh"></video>`
        )
        return document.getElementById('selfie')! as HTMLVideoElement
      }),
      switchMap(vid =>
        selfie(vid).pipe(
          takeUntil(all.pipe(filter(x => x.type === 'selfieStop'))),
          finalize(() => vid.remove())
        )
      )
    )
})

init()
  .pipe(
    switchMap(x => x.ws.handle(handle(x.actor))),
    retryWhen(errs => errs.pipe(delay(250)))
  )
  .subscribe()
