import {
  actors,
  filter,
  map,
  tap,
  Actor,
  take,
  shareReplay,
  switchMap,
  render
} from '../common'
import { fromEvent, merge, of } from 'rxjs'

import * as txt from '../assets/parsed.json'

const ps = new URLSearchParams(location.search)

const init = () => {
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
    of(ps.get('a') as Actor)
  ).pipe(
    filter(actor => actors.includes(actor)),
    take(1),
    tap(() => navigator.vibrate([200, 200, 200])),
    // tap(fullscreen),
    shareReplay()
  )
}

const scenes = txt['AKT I'].scenes.concat(txt['AKT II'].scenes)
const sceneIdx = (parseInt(ps.get('s')!, 10) || 1) - 1

const scene = scenes[sceneIdx]

document.body.style.overflow = 'auto'

init()
  .pipe(
    tap(a => {
      render(`
      <div style="padding:16px">
    <h1>${scene.title} <small>-- ${a}</small></h1>
    ${(scene.plot as any)
      .map(
        (p: any) => `<div style="padding:12px;margin-left:${
          p.who ? 0 : 64
        }px;font-size:${p.who ? 18 : 12}px;${
          p.who === a ? 'background-color:rgba(0,255,0,0.1)' : ''
        }">
      ${
        p.who
          ? `<span style="color:${p.who === a ? 'green' : 'black'}"><b>${
              p.who
            }: </b></span>`
          : ''
      }
      ${p.what}
    </div>`
      )
      .join('')}
    ${
      sceneIdx > 0
        ? `<button id="prev">Scena ${sceneIdx}</button>`
        : '<div id="prev"></div>'
    }
    <button id="next">Scena ${sceneIdx + 2}</button>
    <div>
    `)
    }),
    switchMap(a =>
      merge(
        fromEvent(document.getElementById('next')!, 'click').pipe(
          tap(() => (window.location.href = `/text?s=${sceneIdx + 2}&a=${a}`))
        ),
        fromEvent(document.getElementById('prev')!, 'click').pipe(
          tap(() => (window.location.href = `/text?s=${sceneIdx}&a=${a}`))
        )
      )
    )
  )
  .subscribe()
