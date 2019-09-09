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
  catchError,
  selfie
} from '../common'
import { fromEvent, merge, of, Observable, EMPTY } from 'rxjs'

const ps = new URLSearchParams(location.search)

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
    of(ps.get('a') || ('' as Actor))
  ).pipe(
    map(a => a.toUpperCase() as Actor),
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
    switchMap(x => (x.actor === 'ANIELA' ? selfie(x.ws) : EMPTY)),
    retryWhen(errs =>
      errs.pipe(
        tap(err => console.warn(err)),
        delay(250)
      )
    )
  )
