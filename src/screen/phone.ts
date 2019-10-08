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
import { initPhoneUI, centerContent } from './ui'

const size = fromEvent(window, 'resize').pipe(
  startWith(true),
  map(() => ({ w: window.innerWidth, h: window.innerHeight }))
)

export const phone = (
  root: HTMLDivElement,
  handle: (h: ProtocolHandler) => Observable<unknown>
) => {
  const phone = initPhoneUI(root)

  const h: ProtocolHandler = all => ({
    callStart: cs =>
      cs.pipe(
        switchMap(c =>
          timer(0, 1000).pipe(
            tap(t => t === 0 && phone.start(c.other || c.number)),
            map(t => ({ min: Math.floor(t / 60), sec: t % 60 })),
            tap(({ min, sec }) =>
              phone.updateTime(
                `${min < 10 ? `0${min}` : min}:${sec < 10 ? `0${sec}` : sec}`
              )
            ),
            takeUntil(all.pipe(filter(m => m.type === 'callEnd'))),
            finalize(() => {
              phone.end()
            })
          )
        )
      ),
    callLoud: cs => cs.pipe(tap(phone.loud))
  })

  return merge(size.pipe(tap(centerContent(phone, phone.wrap))), handle(h))
}
