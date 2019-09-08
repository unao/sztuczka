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
  hash,
  sayId,
  playAudio
} from '../common'
import { fromEvent, merge, of, BehaviorSubject, EMPTY } from 'rxjs'

import * as txt from '../assets/parsed.json'
import { listAll, saveRec, Rec, recUrl } from './firebase'

const ps = new URLSearchParams(location.search)

const scenes = txt['AKT I'].scenes.concat(txt['AKT II'].scenes)
document.body.style.overflow = 'auto'

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
    map(a => a.toUpperCase() as Actor),
    filter(actor => actors.includes(actor)),
    take(1),
    shareReplay()
  )
}

const recs$ = new BehaviorSubject<{ [K in string]: Rec }>({})
init()
  .pipe(
    switchMap(a => {
      const ss = scenes
        .map((s, idx) => ({
          idx: idx,
          title: s.title,
          plot: s.plot
            .filter(p => p.who === a)
            .map(p => ({
              ...p,
              id: sayId(idx, p.who!, p.what)
            }))
        }))
        .filter(s => s.plot.length)
      return merge(
        listAll(a).pipe(
          tap(rs => recs$.next(rs)),
          switchMap(() => EMPTY)
        ),
        recs$.pipe(
          tap(rs => console.log(rs)),
          map(rs => ({
            actor: a,
            recs: rs,
            scenes: ss
          }))
        )
      )
    }),
    switchMap(({ recs, scenes, actor }) => {
      console.log('RECS', recs, scenes)

      render(`<div style="padding:16px">
      <h1>${actor}</h1>
      ${scenes
        .map(
          s =>
            `<h3>${s.title}</h3>
            ${s.plot
              .map(
                p => `<div style="padding:8px">
              <div style="margin-bottom:4px">${p.what}</div>
              <button id="rec-${p.id}">nagraj</button>
              ${
                recs[p.id]
                  ? `<button id="play-${recs[p.id].url}">odtwórz</button>`
                  : ''
              }
            </div>`
              )
              .join('')}
        `
        )
        .join('')}
      </div>`)

      return merge(
        fromEvent(document, 'click').pipe(
          map(ev => ev.target && (ev.target as any).id!),
          map((id: string | null) => !!id && id.split('play-')[1]),
          filter(x => !!x),
          tap(x => console.log('url', x)),
          switchMap(u => playAudio(u as string))
        ),
        fromEvent(document, 'click').pipe(
          map(ev => ev.target && (ev.target as any).id!),
          map((id: string | null) => !!id && id.split('rec-')[1]),
          filter(x => !!x),
          take(1),
          tap(x => console.log('id', x)),
          switchMap(id => {
            const btn = document.getElementById('rec-' + id)!
            btn.innerText = 'stop'
            return recordAudio(fromEvent(btn!, 'click'), id as string).pipe(
              switchMap(r =>
                saveRec(actor, r.file).pipe(
                  tap(() =>
                    recs$.next({
                      ...recs$.value,
                      [`${id}`]: {
                        durationMS: r.duration,
                        sayId: id as string,
                        url: recUrl(`${actor}%2F${r.file.name}`)
                      }
                    })
                  )
                )
              )
            )
          })
        )
      )
    })
  )
  .subscribe()

// console.log(
//   scenes.reduce(
//     (acc, s) => {
//       s.plot.forEach(p => p.who && (acc[p.who] = (acc[p.who] || 0) + 1))
//       return acc
//     },
//     {} as any
//   )
// )

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

// recordAudio(fromEvent(document, 'click'), Date.now() + '').pipe(
//  tap(f => console.log(f)),
//  switchMap(({ file, audio }) => {
//    return merge(audio.play(), saveRec('KRYSTIAN', file))
//  })
// )
//  .subscribe()
