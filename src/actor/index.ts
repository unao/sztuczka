import { init } from './init'
import {
  retryWhen,
  delay,
  switchMap,
  ProtocolHandler,
  tap,
  Actor,
  playAudio
} from 'common'
import { setCurrent } from './text'

const handle = (a: Actor): ProtocolHandler => ({
  txt: ms => ms.pipe(tap(setCurrent)),
  msgGet: ms => ms.pipe(switchMap(m => playAudio(`${m.kind}/${a}.mp3`)))
})

init()
  .pipe(
    switchMap(x => x.ws.handle(handle(x.actor))),
    retryWhen(errs => errs.pipe(delay(250)))
  )
  .subscribe()
