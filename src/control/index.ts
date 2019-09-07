import {
  connectWS,
  tap,
  render,
  switchMap,
  map,
  groupBy,
  ServerToControl,
  mergeMap
} from 'common'
import * as play from '../assets/parsed.json'
import { fromEvent, Observable } from 'rxjs'

const handle = {
  conn: (ms: Observable<ServerToControl>) =>
    ms.pipe(
      tap(ms => render(ms.payload.filter(x => x !== 'control').join(' ')))
    )
}

connectWS('control')
  .pipe(
    tap(x => console.log('CONNECTED', x)),
    switchMap(ws => fromEvent<WebSocketEventMap['message']>(ws, 'message')),
    map(m => JSON.parse(m.data) as ServerToControl),
    groupBy(d => d.type),
    mergeMap(ms => handle[ms.key](ms))
    //    tap(() => render(JSON.stringify(play)))
  )
  .subscribe()

console.log('control')
