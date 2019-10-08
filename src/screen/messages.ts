import { Observable, fromEvent, merge, Observer, of, from, timer } from 'rxjs'

import {
  ProtocolHandler,
  startWith,
  map,
  tap,
  mergeMap,
  delay,
  take,
  debounceTime,
  filter,
  switchMap,
  scan,
  concatMap,
  delayWhen,
  takeUntil
} from '../common'
import { centerContent, smsUI } from './ui'
import bodyParser = require('body-parser')

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
    handle(all => ({
      msgShow: ms =>
        ms.pipe(
          mergeMap(m =>
            Observable.create(
              (
                obs: Observer<{
                  el: HTMLDivElement
                  body: string
                  type: boolean
                }>
              ) => {
                const div = document.createElement('div')
                cont.append(div)
                div.innerHTML = smsUI(m.other || m.number, m.who, '')
                console.log(m, div)
                obs.next({
                  el: div.getElementsByClassName('msg')[0] as HTMLDivElement,
                  body: m.body,
                  type:
                    (m as any).who === 'Darek' ||
                    (m.who === 'EWA' && m.other === 'Czarek') ||
                    (m.who === 'CZAREK' && m.other === 'Ewa')
                })
              }
            ).pipe(
              switchMap(
                ({
                  el,
                  body,
                  type
                }: {
                  el: HTMLDivElement
                  body: string
                  type: boolean
                }) =>
                  (!type
                    ? of(body)
                    : from(body.split('')).pipe(
                        scan((a, l) => a + l, ''),
                        concatMap(t =>
                          timer(50 + Math.random() * 50).pipe(map(() => t))
                        )
                      )
                  ).pipe(tap(n => (el.innerText = n)))
              )
            )
          ),
          debounceTime(8000),
          tap(() =>
            Array.from(cont.children).forEach(d =>
              Object.assign((d.children[0] as HTMLElement).style, {
                opacity: '0',
                filter: 'blur(25px)'
              })
            )
          ),
          delayWhen(() =>
            timer(1000).pipe(
              takeUntil(all.pipe(filter(m => m.type === 'msgShow')))
            )
          ),
          tap(() => (cont.innerHTML = ''))
        )
    }))
  )
}
