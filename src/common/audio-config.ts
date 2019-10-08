import { Observable, merge, timer, EMPTY, from } from 'rxjs'
import { playAudio, smoothVolume } from './dom'
import { mergeMap, delayWhen, scan, switchMap } from 'rxjs/operators'

const def = (obs?: (el: HTMLAudioElement) => Observable<unknown>) =>
  [
    2000 as number,
    2000 as number,
    true as boolean,
    obs || (() => EMPTY)
  ] as const

const configs: { [K in string]: ReturnType<typeof def> } = {
  'call/CZAREK.mp3': def(),
  'sound/telefony-telefony.mp3': def(),
  'sound/doorbellx3.mp3': [
    0,
    0,
    false,
    () =>
      merge(
        from([144, 120, 99]).pipe(
          scan((acc, n) => acc + n, 0),
          delayWhen(v => timer(v)),
          mergeMap(() => playAudio('sound/doorbell.mp3'))
        )
      )
  ],
  'call/KAROLINA.mp3': [
    0,
    0,
    true,
    (el: HTMLAudioElement) =>
      timer(3000).pipe(
        switchMap(() => smoothVolume(el, { to: 0.33, duration: 2000 }))
      )
  ],
  'sound/KRYSTIANjacks-end.mp3': def(),
  'sms/KRYSTIANjacks.mp3': [
    0,
    0,
    false,
    (el: HTMLAudioElement) =>
      timer(4000).pipe(
        switchMap(() => smoothVolume(el, { to: 0.1, duration: 1000 }))
      )
  ]
}

export const getAudioConfig = (s: string) => {
  const c = configs[s]
  if (c) {
    return {
      smoothStart: c[0],
      smoothEnd: c[1],
      vibrate: c[2],
      custom: c[3]
    }
  } else {
    return null
  }
}
