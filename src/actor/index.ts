import { init } from './init'
import { retryWhen, delay, switchMap, ProtocolHandler, tap } from 'common'
import { setCurrent } from './text'

const handle: ProtocolHandler = {
  txt: ms => ms.pipe(tap(setCurrent))
}

init()
  .pipe(
    switchMap(x => x.ws.handle(handle)),
    retryWhen(errs => errs.pipe(delay(250)))
  )
  .subscribe()
