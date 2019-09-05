import {
  actors,
  filter,
  map,
  tap,
  Actor,
  take,
  shareReplay,
  switchMap,
  connectWS,
  render,
  fullscreen
} from '../common'
import { fromEvent } from 'rxjs'

const selectActor = () => {
  render(
    actors
      .map(
        a => `<button style="margin:32px;padding:32px" id="${a}">${a}</button>`
      )
      .join('')
  )

  return fromEvent(document, 'click').pipe(
    filter(ev =>
      actors.includes(
        (ev.target && ((ev.target as HTMLElement).id as any)) || ''
      )
    ),
    map(ev => (ev.target as HTMLElement).id as Actor),
    take(1),
    tap(() => navigator.vibrate([200, 200, 200, 200, 200])),
    tap(fullscreen),
    shareReplay()
  )
}

export const init = () =>
  selectActor().pipe(
    switchMap(a =>
      connectWS(a).pipe(
        map(ws => ({
          ws,
          actor: a
        }))
      )
    ),
    tap(a =>
      render(`
<h1>${a.actor}</h1>
<h3>...ale, ale momencik...<h1>`)
    )
  )
