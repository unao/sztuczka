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
import { merge } from 'rxjs'
import { logic } from './actions'

const handle = (a: Actor, send: Send): ProtocolHandler => all => ({
  vibrate: ms => ms.pipe(tap(() => navigator.vibrate([2000]))),
  txt: ms => ms.pipe(tap(setCurrent)),
  msgGet: ms =>
    ms.pipe(switchMap(m => playAudio(`${m.kind}/${a}${m.variant || ''}.mp3`))),
  callGet: ms =>
    ms.pipe(
      switchMap(c =>
        playAudio(`call/${a}.mp3`, { smoothStart: 2000 }).pipe(
          repeat(),
          takeUntil(
            all.pipe(
              filter(x => x.type === 'callStart' || x.type === 'callEnd')
            )
          )
        )
      )
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
          tap(f => send('img', { url: f, duration: 1200 }, 'screen')),
          takeUntil(all.pipe(filter(x => x.type === 'selfieStop'))),
          finalize(() => vid.remove())
        )
      )
    )
})

init()
  .pipe(
    switchMap(x =>
      merge(
        // playAudio('sound/silence.mp3', { vibrate: false }).pipe(repeat()),
        x.ws.handle(handle(x.actor, x.ws.send)),
        logic(document.body)
      )
    ),
    retryWhen(errs => errs.pipe(delay(250)))
  )
  .subscribe()
