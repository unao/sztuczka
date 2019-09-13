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

state.updateScene('SCENA 4')

document.body.style.overflow = 'auto'

const initUI = () => {
  render(`<div style="padding:16px">
      <select id="scene-select" style="font-size:24px;margin:16px">
        ${sceneTitles
          .map(
            s =>
              `<option ${
                s === state.scene.value ? 'selected' : ''
              } value="${s}">${s}</option>`
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
    scene: document.getElementById('scene')! as HTMLDivElement,
    connected: document.getElementById('connected') as HTMLDivElement,
    sceneSelect: document.getElementById('scene-select') as HTMLSelectElement
  }
}

const el = initUI()
const ui = <K extends keyof ReturnType<typeof initUI>>(k: K, c: string) =>
  (el[k].innerHTML = c)

el.sceneSelect.onchange = () => state.updateScene(el.sceneSelect.value)

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
            handleScene(txt.find(t => t.title === s)!.plot, el.scene)
          )
        )
      )
    )
  )
  .subscribe()
