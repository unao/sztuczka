import {
  connectWS,
  tap,
  render,
  switchMap,
  retryWhen,
  delay,
  ProtocolHandler,
  playAudio,
  catchError,
  Role,
  filter,
  takeUntil,
  Send,
  exhaustMap
} from 'common'

import { merge, of, EMPTY, fromEvent, timer } from 'rxjs'

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
      ${
        state.showScreen
          ? `<iframe seamless src="${location.origin}/screen" style="width:33vw;height:18.562vw;border:0"></iframe>`
          : ''
      }

      <div>połączeni:</div>
      <div id="connected"></div>
    </div>
  </div>`)

  return {
    sceneSelect: document.getElementById('scene-select') as HTMLSelectElement,
    scene: document.getElementById('scene')! as HTMLDivElement,
    connected: document.getElementById('connected') as HTMLDivElement,
    aux: document.getElementById('aux')! as HTMLDivElement
  }
}

const el = initUI()
const ui = <K extends keyof ReturnType<typeof initUI>>(k: K, c: string) =>
  (el[k].innerHTML = c)

el.sceneSelect.onchange = () => {
  state.updateScene(parseInt(el.sceneSelect.value.replace('scene-', ''), 10))
  document.activeElement && (document.activeElement as any).blur()
}

let conn: Role[] = []
const handle: ProtocolHandler = all => ({
  conn: rs =>
    rs.pipe(
      tap(rs => (conn = rs)),
      tap(r => ui('connected', r.filter(x => x !== 'control').join(' ')))
    )
})

const key = (s: string) =>
  fromEvent<KeyboardEvent>(document, 'keydown').pipe(filter(ev => ev.key === s))

const stopAll = (send: Send) =>
  key('s').pipe(
    exhaustMap(() => key('s').pipe(takeUntil(timer(200)))),
    tap(() => {
      send('audioStop', null)
      send('callStart', {} as any)
      send('callEnd', null)
      send('selfieStop', null)
    })
  )

connectWS('control')
  .pipe(
    retryWhen(errs => errs.pipe(delay(250))),
    switchMap(ws =>
      merge(
        stopAll(ws.send),
        ws.handle(handle),
        state.scene.pipe(
          switchMap(s =>
            handleScene(s.plot, s.title === 'SCENA 23', el.scene).pipe(
              tap(x => {
                if (!x) {
                  const idx = txt.findIndex(p => p === s) + 1

                  if (idx === 42) {
                    console.log('THE-END')
                    return
                  }

                  state.updateScene(idx)
                  Array.from(el.sceneSelect.children).forEach(
                    (s, i) => ((s as HTMLOptionElement).selected = i === idx)
                  )
                }
              }),
              switchMap(x => {
                if (x) {
                  ws.send('txt', x.id)
                  if (x.type === 'img') {
                    ws.send(
                      'img',
                      {
                        url:
                          x.what === 'image-stop'
                            ? ''
                            : `/assets/img/${x.what}`,
                        duration: 10 * 60000
                      },
                      'screen'
                    )
                  }
                  if (x.type === 'msgGet') {
                    if (conn.includes(x.who! as Role)) {
                      ws.send('msgGet', x as any, x.who! as any)
                    } else {
                      ws.send(
                        'audioStart',
                        // @ts-ignore
                        { url: `${x.kind}/${x.who!}${x.variant || ''}.mp3` },
                        'screen'
                      )
                    }
                  }
                  if (x.type === 'callGet') {
                    if (conn.includes(x.who! as Role)) {
                      ws.send('callGet', x as any, x.who! as any)
                    } else {
                      ws.send('callGet', x as any, 'screen')
                    }
                  }
                  if (x.type === 'callStart' || x.type === 'callEnd') {
                    ws.send(x.type, x as any, x.who! as any)
                    ws.send(x.type, x as any, 'screen')
                  }
                  if (x.type === 'selfieStart' || x.type === 'selfieStop') {
                    ws.send(x.type, x as any, x.who! as any)
                  }
                  if (
                    x.type === 'callLoud' ||
                    x.type === 'audioStart' ||
                    x.type === 'audioStop' ||
                    x.type === 'msgShow'
                  ) {
                    ws.send(x.type, x as any, 'screen')
                  }
                  if (x.type === 'say' && x.who!.endsWith('(GŁOS W TEL.)')) {
                    const v = x
                      .who!.replace(' (GŁOS W TEL.)', '')
                      .replace(/\s/g, '_')
                      .toLowerCase()
                    return playAudio(`voices/${v}.mp3`).pipe(
                      catchError(err => {
                        console.warn('MISSING AUDIO', err, x, v)
                        return of(true)
                      })
                    )
                  }
                  if (x.type === 'say' && state.missing.includes(x.who!)) {
                    return playAudio(`recs/${x.who}/${x.id}.webm`)
                  }
                  if (x.type === 'vibrate') {
                    ws.send('vibrate', null)
                  }
                }
                return EMPTY
              })
            )
          )
        )
      )
    )
  )
  .subscribe()
