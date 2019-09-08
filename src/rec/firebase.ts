import * as F from 'firebase/app'
import 'firebase/storage'
import { Actor, map, tap } from 'common'
import { defer } from 'rxjs'
import { pathToFileURL } from 'url'

F.initializeApp({
  apiKey: 'AIzaSyBEab6rgh5TpMyRGSjcIy_OmUV_xD1laLg',
  projectId: 'g25-luna',
  storageBucket: 'g25-luna.appspot.com',
  appId: '1:812444916025:web:007c91e2b45db16152b0e8'
})

export const recUrl = (path: string) =>
  `https://firebasestorage.googleapis.com/v0/b/g25-luna.appspot.com/o/${path}?alt=media`

export interface Rec {
  url: string
  sayId: string
  durationMS: number
}

export const listAll = (actor: Actor) =>
  defer(() =>
    F.storage()
      .ref(`/${actor}/`)
      .listAll()
  ).pipe(
    tap(ls => console.log(ls.items.map(l => l.name))),
    map(ls =>
      ls.items.reduce(
        (acc, i) => {
          const [_, sayId, duration] = i.name.split('__')
          acc[sayId] = {
            sayId,
            durationMS: parseInt(duration.replace('.webm', ''), 10),
            url: recUrl(`${actor}%2F${i.name}`)
          } as Rec
          return acc
        },
        {} as { [K in string]: Rec }
      )
    )
  )

export const saveRec = (a: Actor, f: File) =>
  defer(() =>
    F.storage()
      .ref(`/${a}/${f.name}`)
      .put(f, {
        customMetadata: {
          'Content-Type': 'audio/webm',
          'Cache-Control': 'public, max-age: 256000'
        }
      })
  )
