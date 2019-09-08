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
  recordAudio
} from '../common'
import { fromEvent, merge, of, Observable, EMPTY, pipe } from 'rxjs'

import * as txt from '../assets/parsed.json'
import { listAll, saveRec } from './firebase'

const ps = new URLSearchParams(location.search)

const scenes = txt['AKT I'].scenes.concat(txt['AKT II'].scenes)

recordAudio(fromEvent(document, 'click'), 'test')
  .pipe(
    tap(f => console.log(f)),
    switchMap(f => {
      const u = URL.createObjectURL(f)
      const audio = document.createElement('audio')
      audio.src = u
      document.body.append(audio)
      console.log('audio', audio.duration)
      return merge(audio.play(), saveRec('KRYSTIAN', f))
    })
  )
  .subscribe()

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
    tap(() => navigator.vibrate([200, 200, 200])),
    // tap(fullscreen),
    shareReplay()
  )
}

init()
  .pipe(
    switchMap(a => listAll(a)),
    tap(fs => console.log('WTF', fs))
  )
  .subscribe()
