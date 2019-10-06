import { init } from './init'
import {
  retryWhen,
  delay,
  switchMap,
  ProtocolHandler,
  tap,
  Actor,
  playAudio,
  takeUntil,
  filter,
  selfie,
  map,
  finalize,
  Send,
  repeat,
  fullscreen
} from 'common'
import { setCurrent } from './text'
import { merge, fromEvent } from 'rxjs'
import { logic } from './actions'

import { callEndBtn } from '../screen/ui'

const handle = (a: Actor, send: Send): ProtocolHandler => all => ({
  vibrate: ms => ms.pipe(tap(() => navigator.vibrate([2000]))),
  txt: ms => ms.pipe(tap(setCurrent)),
  msgGet: ms =>
    ms.pipe(switchMap(m => playAudio(`${m.kind}/${a}${m.variant || ''}.mp3`))),
  callGet: ms =>
    ms.pipe(
      switchMap(() => {
        document.body.insertAdjacentHTML(
          'beforeend',
          callEndBtn(
            'call-end-btn',
            'position:fixed; z-index:50; bottom: 64px; left: 40vw;transform: scale(2)'
          )
        )
        const btn = document.getElementById('call-end-btn')!
        return playAudio(`call/${a}.mp3`, {
          smoothStart: 2000,
          smoothEnd: 0
        }).pipe(
          repeat(),
          takeUntil(
            merge(
              fromEvent(document, 'click').pipe(
                filter(e => !!e.target && (e.target as any).id === btn.id)
              ),
              all.pipe(
                filter(x => x.type === 'callStart' || x.type === 'callEnd')
              )
            )
          ),
          finalize(() => btn.remove())
        )
      })
    ),
  selfieStart: ms =>
    ms.pipe(
      tap(fullscreen),
      map(() => {
        document.body.insertAdjacentHTML(
          'beforeend',
          `<video id="selfie" style="z-index:2;position:fixed;top:0;left:0;background-color:black;width:100vw;height:100vh"></video>`
        )
        return document.getElementById('selfie')! as HTMLVideoElement
      }),
      switchMap(vid =>
        selfie(vid).pipe(
          tap(f => send('img', { url: f, duration: 350 }, 'screen')),
          takeUntil(all.pipe(filter(x => x.type === 'selfieStop'))),
          finalize(() => vid.remove())
        )
      )
    )
})

init()
  .pipe(
    switchMap(x =>
      merge(x.ws.handle(handle(x.actor, x.ws.send)), logic(document.body))
    ),
    retryWhen(errs => errs.pipe(delay(250)))
  )
  .subscribe()
