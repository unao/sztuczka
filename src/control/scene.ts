import { Plot, Say as _Say } from './state'
import { BehaviorSubject, merge, fromEvent, EMPTY } from 'rxjs'
import { filter, tap, map, switchMap } from 'common'

type Say = _Say & { next: () => Say | undefined }

const current = new BehaviorSubject<{
  say: Say
  el: HTMLDivElement
}>({} as any)

const ui = {
  desc: (p: _Say) =>
    `<div style="padding:4px;margin-left:64px;font-size:12px;">
      ${p.what}
    </div>`,

  say: (p: _Say) =>
    `<div id="txt-${p.id}" style="padding:8px;font-size:18px;cursor:pointer">
      <b>${p.who}: </b>
      ${p.what}
    </div>`
}

const txtUI = (plot: Plot) =>
  `<div style="padding:8px;max-width:80%">
    ${plot.map(p => ui[p.type as keyof typeof ui](p)).join('')}
    <button id="next-scene" style="padding:8px;margin:8px">Następna</button>
  </div>`

const el = (i: string) => document.getElementById(`txt-${i}`)! as HTMLDivElement
const sel = (s?: Say & { next: () => Say | undefined }) => {
  current.value.el.style.border = null
  s &&
    current.next({
      say: s,
      el: el(s.id)
    })
}

export const handleScene = (plot: Plot, root: HTMLDivElement) => {
  root.innerHTML = txtUI(plot)
  const _says = plot.filter(p => !!p.who)
  const says = _says.map((s, idx) => ({ ...s, next: () => says[idx + 1] }))
  current.next({
    say: says[0],
    el: el(says[0].id)
  })
  document.body.scrollIntoView()
  return merge(
    merge(
      current.pipe(
        tap(c => (el(c.say.id).style.border = '1px solid rgb(30,200,30)'))
      ),
      fromEvent<KeyboardEvent>(document, 'keydown').pipe(
        tap(e => e.key === 'ArrowDown' && sel(current.value.say.next()))
      )
    ).pipe(switchMap(() => EMPTY)),
    ...says.map(s =>
      fromEvent(el(s.id), 'click').pipe(
        map(() => s),
        tap(() => sel(s))
      )
    ),
    merge(
      fromEvent(document.getElementById('next-scene')!, 'click'),
      fromEvent<KeyboardEvent>(document, 'keydown').pipe(
        filter(e => e.key === 'ArrowRight' || !current.value.say.next())
      )
    ).pipe(map(() => undefined))
  )
}
