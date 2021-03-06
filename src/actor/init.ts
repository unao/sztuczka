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
  delay,
  retryWhen,
  fullscreen
} from '../common'
import { fromEvent, merge, of } from 'rxjs'
import { text } from './text'
import { callStartBtn } from 'screen/ui'

const ps = new URLSearchParams(location.search)

const preventBack = () => {
  window.history.pushState(null, document.title, window.location.href)
  window.onpopstate = () =>
    window.history.pushState(null, document.title, window.location.href)
}

const selectActor = () => {
  render(
    actors
      .concat(['TEKST' as Actor])
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
    filter(actor => actor === ('TEKST' as Actor) || actors.includes(actor)),
    take(1),
    tap(() => !ps.has('fake') && fullscreen()),
    tap(
      a =>
        !ps.has('fake') &&
        a === 'ANIELA' &&
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then(s => s.getTracks().forEach(t => t.stop()))
    ),
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
      )
    ),
    tap(a =>
      render(`
      <h1>${a.actor}</h1>
      ${text(a.actor)}
      <video style="z-index:-1;position:fixed" src="/assets/eclipse.mp4" autoplay loop></video>
      `)
    ),
    tap(
      a =>
        a.actor === ('TEKST' as Actor) &&
        (document.body.style.overflow = 'auto')
    ),
    tap(() =>
      document.body.insertAdjacentHTML(
        'beforeend',
        callStartBtn(
          'display:none;position:fixed;z-index:50;bottom:64px;left:40vw;transform:scale(3)'
        )
      )
    ),
    tap(() => setTimeout(preventBack, 1000)),
    retryWhen(errs =>
      errs.pipe(
        tap(err => console.warn(err)),
        delay(250)
      )
    )
  )
