import { Observable, fromEvent, merge, Observer } from 'rxjs'

import {
  ProtocolHandler,
  startWith,
  map,
  tap,
  mergeMap,
  delay,
  take,
  debounceTime,
  filter
} from '../common'
import { centerContent, smsUI } from './ui'

type Config = ReturnType<typeof config>
const config = () => {
  const ps = new URLSearchParams(window.location.search)
  const w = parseInt(ps.get('w') || '3', 10)
  const h = parseInt(ps.get('h') || '4', 10)
  const ratio = w / h
  return {
    ratio,
    width: 320,
    height: 320 / ratio
  }
}

const container = (root: HTMLDivElement, cfg: Config) => {
  const c = document.createElement('div')
  Object.assign(c.style, {
    zIndex: 5,
    position: 'fixed',
    width: `${cfg.width}px`,
    height: `${cfg.height}px`,
    top: 0,
    left: 0
  })
  root.append(c)
  return c
}

const size = fromEvent(window, 'resize').pipe(
  startWith(true),
  map(() => ({ w: window.innerWidth, h: window.innerHeight }))
)

export const content = (
  root: HTMLDivElement,
  handle: (h: ProtocolHandler) => Observable<unknown>
) => {
  const cfg = config()
  const cont = container(root, cfg)
  return merge(
    size.pipe(tap(centerContent(cfg, cont))),
    handle(() => ({
      msgShow: ms =>
        ms.pipe(
          mergeMap(m =>
            Observable.create((obs: Observer<HTMLDivElement>) => {
              const div = document.createElement('div')
              cont.append(div)
              div.innerHTML = smsUI(m.other || m.number, m.who, m.body)
              obs.next(div.children[0]! as any)
            }).pipe(
              delay(8000),
              tap((d: HTMLDivElement) =>
                Object.assign(d.style, {
                  opacity: '0',
                  filter: 'blur(25px)'
                })
              ),
              filter(() => false),
              startWith(true)
            )
          ),
          debounceTime(9000),
          tap(() => (cont.innerHTML = ''))
        )
    }))
  )
}
