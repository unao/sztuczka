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
  fullscreen,
  delay,
  retryWhen,
  playAudio,
  catchError
} from '../common'
import { fromEvent, merge, of, Observable, EMPTY } from 'rxjs'

const selectActor = () => {
  render(
    actors
      .map(
        a => `<button style="margin:32px;padding:32px" id="${a}">${a}</button>`
      )
      .join('')
  )

  return merge(
    fromEvent(document, 'click').pipe(
      map(ev => (ev.target as HTMLElement).id as Actor)
    ),
    of(location.search.split('a=')[1] as Actor)
  ).pipe(
    filter(actor => actors.includes(actor)),
    take(1),
    tap(() => navigator.vibrate([200, 200, 200])),
    tap(fullscreen),
    shareReplay()
  )
}

export const init = () =>
  selectActor().pipe(
    switchMap(a =>
      merge(
        connectWS(a).pipe(
          map(ws => ({
            ws,
            actor: a
          }))
        )
        // playAudio(`/call/${a}.mp3`).pipe(catchError(() => EMPTY))
      )
    ),
    tap(a =>
      render(`
<h1>${a.actor}</h1>
<h3>...ale, ale momencik...<h1>`)
    ),
    retryWhen(errs =>
      errs.pipe(
        tap(err => console.warn(err)),
        delay(1000)
      )
    )
  )
