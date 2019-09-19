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
  filter
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
    )
})

init()
  .pipe(
    switchMap(x => x.ws.handle(handle(x.actor))),
    retryWhen(errs => errs.pipe(delay(250)))
  )
  .subscribe()
