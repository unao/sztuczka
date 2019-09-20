import { fromEvent, merge, Observable } from 'rxjs'

import { startWith, map, Protocol, ProtocolHandler, tap } from '../common'
import { initPhoneUI, PhoneUI } from './ui'

const size = fromEvent(window, 'resize').pipe(
  startWith(true),
  map(() => ({ w: window.innerWidth, h: window.innerHeight })),
  tap(x => console.log(x))
)

const msgShow = (m: Protocol['msgShow']) => {}

const callStart = (c: Protocol['callStart']) => {}

const callEnd = () => {}

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

  const h: ProtocolHandler = all => ({})

  return merge(size.pipe(tap(updateLayout(phone))))
}
