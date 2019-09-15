import {
  connectWS,
  tap,
  render,
  switchMap,
  retryWhen,
  delay,
  ProtocolHandler
} from 'common'

import { merge } from 'rxjs'

import { state } from './state'
import { handleScene } from './scene'

const { txt } = state

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

const handle: ProtocolHandler = {
  conn: rs =>
    rs.pipe(tap(r => ui('connected', r.filter(x => x !== 'control').join(' '))))
}

connectWS('control')
  .pipe(
    retryWhen(errs => errs.pipe(delay(250))),
    switchMap(ws =>
      merge(
        ws.handle(handle),
        state.scene.pipe(
          switchMap(s =>
            handleScene(s.plot, s.title === 'SCENA 23', el.scene).pipe(
              tap(x => {
                if (x) {
                  console.log(x)
                  ws.send('txt', x.id)
                  if (x.type === 'msgGet') {
                    ws.send('msgGet', x as any, x.who! as any)
                  }
                }
                if (!x) {
                  const idx = txt.findIndex(p => p === s) + 1

                  if (idx === 41) {
                    console.log('THE-END')
                    return
                  }

                  state.updateScene(idx)
                  Array.from(el.sceneSelect.children).forEach(
                    (s, i) => ((s as HTMLOptionElement).selected = i === idx)
                  )
                }
              })
            )
          )
        )
      )
    )
  )
  .subscribe()
