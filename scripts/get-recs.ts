import * as F from 'firebase-admin'
// import 'firebase/storage'
import { defer, from } from 'rxjs'
import { map, tap, switchMap } from 'rxjs/operators'
import { resolve } from 'path'

F.initializeApp({
  credential: F.credential.cert(require('../cert/firebase.json')),
  storageBucket: 'g25-luna.appspot.com'
})

export const recUrl = (path: string) =>
  `https://firebasestorage.googleapis.com/v0/b/g25-luna.appspot.com/o/${path}?alt=media`

export interface Rec {
  url: string
  sayId: string
  durationMS: number
}

export const getFiles = (actor: string) =>
  defer(() =>
    F.storage()
      .bucket()
      .getFiles({ prefix: actor })
  ).pipe(
    tap(ls => console.log(ls.length)),
    switchMap(([fs]) =>
      from(fs).pipe(
        switchMap(f =>
          f.download({
            destination: resolve(
              __dirname,
              '..',
              'src/assets/recs',
              actor,
              f.name.replace(`${actor}/`, '')
            )
          })
        )
      )
    )
  )

getFiles('ANIELA')
  // .pipe(tap(x => console.log()))
  .subscribe()
