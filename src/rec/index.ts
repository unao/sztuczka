import {
  actors,
  filter,
  map,
  tap,
  Actor,
  take,
  shareReplay,
  switchMap,
  render,
  recordAudio,
  hash
} from '../common'
import { fromEvent, merge, of, Observable, EMPTY, pipe } from 'rxjs'

import * as txt from '../assets/parsed.json'
import { listAll, saveRec } from './firebase'

const ps = new URLSearchParams(location.search)

const scenes = txt['AKT I'].scenes.concat(txt['AKT II'].scenes)

// const hs = scenes.reduce(
//   (acc, s) => {
//     s.plot
//       .filter(p => p.who)
//       .forEach(p => {
//         const h = hash(p.what)
//         if (acc[h] && acc[h][0].what !== p.what) {
//           console.log('collision', p, acc[h])
//         } else {
//           acc[h] = (acc[h] || []).concat([p])
//         }
//       })
//     return acc
//   },
//   {} as any
// )

console.log(
  scenes.reduce(
    (acc, s) => {
      s.plot.forEach(p => p.who && (acc[p.who] = (acc[p.who] || 0) + 1))
      return acc
    },
    {} as any
  )
)

// recordAudio(fromEvent(document, 'click'), Date.now() + '').pipe(
//  tap(f => console.log(f)),
//  switchMap(({ file, audio }) => {
//    return merge(audio.play(), saveRec('KRYSTIAN', file))
//  })
// )
//  .subscribe()

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
    // tap(() => navigator.vibrate([200, 200, 200])),
    shareReplay()
  )
}

init()
  .pipe(
    switchMap(a => listAll(a)),
    tap(fs => console.log('WTF', fs))
  )
  .subscribe()
