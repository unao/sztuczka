import * as F from 'firebase-admin'

import { defer, from } from 'rxjs'
import {
  map,
  switchMap,
  mergeMap,
  last,
  finalize,
  delay,
  retryWhen,
  tap
} from 'rxjs/operators'
import { resolve } from 'path'
import * as fs from 'fs'

import { actors } from '../src/common/names'

F.initializeApp({
  credential: F.credential.cert(require('../cert/firebase.json')),
  storageBucket: 'g25-luna.appspot.com'
})

export const recUrl = (path: string) =>
  `https://firebasestorage.googleapis.com/v0/b/g25-luna.appspot.com/o/${path}?alt=media`

export const getFiles = (actor: string) =>
  defer(() =>
    F.storage()
      .bucket()
      .getFiles({ prefix: actor })
  ).pipe(
    switchMap(([x]) => {
      const fi = x.reduce(
        (acc, i) => {
          const [_, id] = i.name.split('__')
          acc[id] = {
            id,
            file: i
          }
          return acc
        },
        {} as { [K in string]: any }
      )

      const files = Object.keys(fi)
      const dest = resolve(__dirname, '..', 'src/assets/recs', actor)
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest)
      }

      return from(files).pipe(
        map(k => fi[k]),
        mergeMap(
          (f, idx) =>
            defer(() =>
              f.file.download({
                destination: resolve(
                  __dirname,
                  '..',
                  'src/assets/recs',
                  actor,
                  `${f.id}.webm`
                )
              })
            ).pipe(
              retryWhen(errs =>
                errs.pipe(
                  delay(200),
                  tap(() => console.log('RETRY', actor, idx))
                )
              )
            ),
          5
        ),
        finalize(() => console.log('OK', actor, files.length))
      )
    })
  )

from(['ROBERT', 'NELA'] || actors)
  .pipe(mergeMap(a => getFiles(a), 1))
  .subscribe({
    error: e => console.log(e)
  })
