import { fromEvent, merge, Observable, timer } from 'rxjs'

import {
  startWith,
  map,
  ProtocolHandler,
  tap,
  switchMap,
  takeUntil,
  filter,
  finalize
} from '../common'
import { initPhoneUI, PhoneUI } from './ui'

const size = fromEvent(window, 'resize').pipe(
  startWith(true),
  map(() => ({ w: window.innerWidth, h: window.innerHeight })),
  tap(x => console.log(x))
)

const updateLayout = (c: PhoneUI) => (s: { w: number; h: number }) => {
  const h = s.h - 40
  const r = h / c.height
  const w = c.width * r

  c.wrap.style.top = '20px'
  c.wrap.style.left = `${(s.w - w) / 2}px`
  c.wrap.style.transform = `scale(${r})`
  c.wrap.style.transformOrigin = `top left`
}

export const run = (
  root: HTMLDivElement,
  handle: (h: ProtocolHandler) => Observable<unknown>
) => {
  const phone = initPhoneUI(root)

  const h: ProtocolHandler = all => ({
    callStart: cs =>
      cs.pipe(
        tap(x => console.log(x)),
        tap(c => phone.start(c.other || c.number)),
        switchMap(() =>
          timer(0, 1000).pipe(
            map(t => ({ min: Math.floor(t / 60), sec: t % 60 })),
            tap(({ min, sec }) =>
              phone.updateTime(
                `${min < 10 ? `0${min}` : min}:${sec < 10 ? `0${sec}` : sec}`
              )
            ),
            takeUntil(all.pipe(filter(m => m.type === 'callEnd'))),
            finalize(() => phone.end())
          )
        )
      )
  })

  return merge(size.pipe(tap(updateLayout(phone))), handle(h))
}
