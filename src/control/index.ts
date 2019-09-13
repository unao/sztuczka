import {
  connectWS,
  tap,
  render,
  switchMap,
  map,
  groupBy,
  ServerToControl,
  mergeMap
} from 'common'

import { fromEvent, Observable, merge } from 'rxjs'

import { state } from './state'
import { handleScene } from './scene'

const { txt, sceneTitles } = state

document.body.style.overflow = 'auto'

const initUI = () => {
  render(`<div style="padding:16px">
      <select id="scene-select" style="font-size:24px;margin:16px">
        ${txt
          .map(
            (s, idx) =>
              `<option ${
                s === state.scene.value ? 'selected' : ''
              } value="scene-${idx}">${s.title}</option>`
          )
          .join('')}
      </select>
    <div id="scene" style="width:66vw"></div>

    <div id="aux" style="width:33vw;position:fixed;right:0;top:0">
      <iframe seamless src="${
        location.origin
      }/screen" style="width:33vw;height:18.562vw;border:0"></iframe>

      <div>połączeni:</div>
      <div id="connected"></div>
    </div>
  </div>`)

  return {
    sceneSelect: document.getElementById('scene-select') as HTMLSelectElement,
    scene: document.getElementById('scene')! as HTMLDivElement,
    connected: document.getElementById('connected') as HTMLDivElement
  }
}

const el = initUI()
const ui = <K extends keyof ReturnType<typeof initUI>>(k: K, c: string) =>
  (el[k].innerHTML = c)

el.sceneSelect.onchange = () =>
  state.updateScene(parseInt(el.sceneSelect.value.replace('scene-', ''), 10))

const handle = {
  conn: (ms: Observable<ServerToControl>) =>
    ms.pipe(
      tap(ms =>
        ui('connected', ms.payload.filter(x => x !== 'control').join(' '))
      )
    )
}

connectWS('control')
  .pipe(
    switchMap(ws => fromEvent<WebSocketEventMap['message']>(ws, 'message')),
    map(m => JSON.parse(m.data) as ServerToControl),
    groupBy(d => d.type),
    mergeMap(ms =>
      merge(
        handle[ms.key](ms),
        state.scene.pipe(
          switchMap(s =>
            handleScene(s.plot, el.scene).pipe(
              tap(x => !x && state.updateScene(txt.findIndex(p => p === s) + 1))
            )
          )
        )
      )
    )
  )
  .subscribe()
