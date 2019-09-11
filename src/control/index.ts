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
import * as play from '../assets/parsed.json'
import { fromEvent, Observable } from 'rxjs'

const txt = play['AKT I'].scenes.concat(play['AKT II'].scenes)
const sceneTitles = txt.map(s => s.title)
const plot = txt.reduce(
  (acc, t) => acc.concat(t.plot.filter(p => !!p.who)),
  [] as Array<{
    type: string
    who?: string
    what: string
    id: string
  }>
)

document.body.style.overflow = 'auto'

const txtUI = txt
  .map(
    (scene, idx) =>
      `<div style="padding:8px;max-width:80%">
  <div id="scene-${idx}" style="font-size:18px;margin-left:32px">-- ${
        scene.title
      } --</div>
    ${scene.plot
      .filter(p => !!p.who)
      .map(
        p => `<div id="txt-${p.id}" style="padding:4px;margin-left:${
          p.who ? 0 : 64
        }px;font-size:${p.who ? 18 : 12}px;">
  ${p.who ? `<span style="color:black"><b>${p.who}: </b></span>` : ''}
  ${p.what}
    </div>`
      )
      .join('')}
  </div>`
  )
  .join('')

const initUI = () => {
  render(`<div style="padding:16px">
    <div id="scenario" style="width:66vw"></div>

    <div id="aux" style="width:33vw;position:fixed;right:0;top:0">
      <iframe seamless src="${
        location.origin
      }/screen" style="width:33vw;height:18.562vw;border:0"></iframe>

      <select id="scene-select" style="font-size:24px;margin:16px">
        <div>połączeni:</div>
        ${sceneTitles
          .map((s, idx) => `<option value="scene-${idx}">${s}</option>`)
          .join('')}
      </select>


      <div id="connected"></div>
    </div>
  </div>`)

  return {
    scenario: document.getElementById('scenario')! as HTMLDivElement,
    connected: document.getElementById('connected') as HTMLDivElement,
    sceneSelect: document.getElementById('scene-select') as HTMLSelectElement
  }
}

const el = initUI()
const ui = <K extends keyof ReturnType<typeof initUI>>(k: K, c: string) =>
  (el[k].innerHTML = c)

ui('scenario', txtUI)

el.sceneSelect.onchange = ev => {
  console.log(el.sceneSelect.value)
  document.getElementById(el.sceneSelect.value)!.scrollIntoView()
}

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
    mergeMap(ms => handle[ms.key](ms))
  )
  .subscribe()
