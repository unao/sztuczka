import { Plot, Say } from './state'
import { BehaviorSubject, merge, fromEvent, EMPTY } from 'rxjs'
import { tap, map, filter, switchMap } from 'common'

const current = new BehaviorSubject<{ say: Say; el: HTMLDivElement }>({} as any)

const ui = {
  desc: (p: Say) =>
    `<div style="padding:4px;margin-left:64px;font-size:12px;">
      ${p.what}
    </div>`,

  say: (p: Say) =>
    `<div id="txt-${p.id}" style="padding:4px;font-size:18px;cursor:pointer">
      <b>${p.who}: </b>
      ${p.what}
    </div>`
}

const txtUI = (plot: Plot) =>
  `<div style="padding:8px;max-width:80%">
    ${plot.map(p => ui[p.type as keyof typeof ui](p)).join('')}
  </div>`

const el = (i: string) => document.getElementById(`txt-${i}`)! as HTMLDivElement
const sel = (s: Say) => {
  current.value.el.style.backgroundColor = 'white'
  current.next({
    say: s,
    el: el(s.id)
  })
}

export const handleScene = (plot: Plot, root: HTMLDivElement) => {
  root.innerHTML = txtUI(plot)
  const says = plot.filter(p => !!p.who)
  current.next({
    say: says[0],
    el: el(says[0].id)
  })
  return merge(
    merge(
      current.pipe(tap(c => (el(c.say.id).style.backgroundColor = 'green')))
    ).pipe(switchMap(() => EMPTY)),
    fromEvent(document, 'click').pipe(
      map(ev => ev.target && (ev.target as any).id!),
      map((id: string | null) => !!id && id.split('txt-')[1]),
      map(x => says.find(s => s.id === x)!),
      filter(s => !!s),
      tap(sel)
    )
  )
}
