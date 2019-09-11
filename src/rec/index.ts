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
  playAudio,
  delay
} from '../common'
import { fromEvent, merge, of, BehaviorSubject, EMPTY, defer } from 'rxjs'

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
    of(ps.get('a') || ('' as Actor))
  ).pipe(
    map(a => a.toUpperCase() as Actor),
    filter(actor => actors.includes(actor)),
    take(1),
    switchMap(a =>
      defer(() =>
        navigator.mediaDevices.getUserMedia({
          audio: true
        })
      ).pipe(map(s => ({ stream: s, actor: a })))
    ),
    shareReplay()
  )
}

const recs$ = new BehaviorSubject<{ [K in string]: Rec & { new?: true } }>({})
init()
  .pipe(
    switchMap(({ stream, actor }) => {
      const ss = scenes
        .map((s, idx) => ({
          idx: idx,
          title: s.title,
          plot: s.plot.filter(p => p.who === actor)
        }))
        .filter(s => s.plot.length)
      return merge(
        listAll(actor).pipe(
          tap(rs => recs$.next(rs)),
          switchMap(() => EMPTY)
        ),
        recs$.pipe(
          tap(rs => console.log(rs)),
          map(rs => ({
            stream,
            actor,
            recs: rs,
            scenes: ss
          }))
        )
      )
    }),
    switchMap(({ recs, scenes, actor, stream }) => {
      console.log('RECS', recs, scenes)

      render(`<div style="padding:16px">
      <h1>${actor}</h1>
      ${scenes
        .map(
          s =>
            `<h3>${s.title}</h3>
            ${s.plot
              .map(p =>
                ps.get('f') === 'no' && recs[p.id] && !recs[p.id].new
                  ? ''
                  : `<div style="${
                      recs[p.id] ? 'background-color:rgba(0,200,0,0.08);' : ''
                    }padding:8px">
              <div style="margin-bottom:4px">${p.what}</div>
              <button style="padding:8px" id="rec-${p.id}">nagraj</button>
              ${
                recs[p.id]
                  ? `<button style="padding:8px" id="play-${recs[p.id].url}">odtwórz</button>`
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
          delay(128),
          switchMap(id => {
            const btn = document.getElementById('rec-' + id)!
            btn.innerText = 'stop'
            return recordAudio(
              stream,
              fromEvent(btn!, 'click'),
              id as string
            ).pipe(
              switchMap(r =>
                saveRec(actor, r.file).pipe(
                  tap(() =>
                    recs$.next({
                      ...recs$.value,
                      [`${id}`]: {
                        new: true,
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
  .subscribe({
    error: err =>
      render(`<div style="background-color:rgba(255,0,0,0.05);padding:16px">
      <h1>Critical Error</h1>
      <pre>
        ${err && err.message}
      </pre>
    </div>`)
  })

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
