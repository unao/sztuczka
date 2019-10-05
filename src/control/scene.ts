import { Plot, Say as _Say } from './state'
import { BehaviorSubject, merge, fromEvent, EMPTY, Subject } from 'rxjs'
import { filter, tap, map, switchMap, throttleTime } from 'common'

type Say = _Say & { next: () => Say | undefined }

const current = new BehaviorSubject<{
  say?: Say
  el: HTMLDivElement
}>({} as any)

const ui = (p: _Say) => {
  if (p.type === 'say') {
    return `<div id="txt-${p.id}" style="padding:8px;font-size:18px;cursor:pointer">
        <b>${p.who}: </b>
        ${p.what}
      </div>`
  } else if (p.type === 'desc') {
    return `<div style="padding:4px;margin-left:64px;font-size:12px;">
    ${p.what}
  </div>`
  } else {
    return `<div id="txt-${p.id}" style="padding:16px;color:gray;font-size:18px;cursor:pointer">
    <b>${p.what}</b>
  </div>`
  }
}

const txtUI = (plot: Plot) =>
  `<div style="padding:8px;max-width:80%">
    ${plot.map(p => ui(p)).join('')}
    <button id="next-scene" style="padding:8px;margin:8px">Następna</button>
  </div>`

const forceNext = new Subject<unknown>()

const el = (i: string) => document.getElementById(`txt-${i}`)! as HTMLDivElement
const sel = (s?: Say & { next: () => Say | undefined }) => {
  if (s) {
    current.value.el.style.border = null
    const e = el(s.id)
    current.value.say && current.value.say.next() === s
      ? current.value.el.scrollIntoView()
      : e.scrollIntoView()
    e.style.border = '2px solid black'
    current.next({
      say: s,
      el: e
    })
    if (
      s.type !== 'say' &&
      s.type !== 'audioWait' &&
      s.type !== 'audioStart' &&
      s.type !== 'callGet'
    ) {
      forceNext.next()
    }
  } else {
    current.next({
      say: undefined,
      el: current.value.el
    })
  }
}

export const handleScene = (
  plot: Plot,
  actIEnd: boolean,
  root: HTMLDivElement
) => {
  root.innerHTML = txtUI(plot)
  const _says = plot.filter(p => p.type !== 'desc')
  const says = _says.map((s, idx) => ({ ...s, next: () => says[idx + 1] }))
  current.next({
    say: says[0],
    el: says[0] && el(says[0].id)
  })
  sel(says[0])
  window.scrollTo(0, 0)
  return merge(
    ...says.map(s =>
      fromEvent(el(s.id), 'click')
        .pipe(
          map(() => s),
          tap(() => sel(s))
        )
        .pipe(switchMap(() => EMPTY))
    ),
    current.pipe(map(c => c.say)),
    merge(
      fromEvent(document.getElementById('next-scene')!, 'click'),
      merge(
        forceNext,
        fromEvent<KeyboardEvent>(document, 'keydown').pipe(
          filter(e => e.key === 'ArrowDown'),
          tap(e => e.preventDefault()),
          throttleTime(200)
        )
      ).pipe(
        tap(() => sel(current.value.say && current.value.say.next())),
        filter(_ => !current.value.say && !actIEnd)
      )
    ).pipe(map(() => undefined))
  )
}
