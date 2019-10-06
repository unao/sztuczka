import * as fs from 'fs'
import { resolve } from 'path'
import { from, defer } from 'rxjs'
import { tap, map, mergeMap } from 'rxjs/operators'
// @ts-ignore
import * as normalize from 'ffmpeg-normalize'

const inAssets = (s: string) => resolve(__dirname, '../assets', s)

from(['call', 'sms', 'sound', 'voices'])
  .pipe(
    map(inAssets),
    mergeMap(f => fs.readdirSync(f).map(n => [`${f}/${n}`, `${f}/_${n}`])),
    tap(([_, o]) => fs.existsSync(o) && fs.unlinkSync(o)),
    mergeMap(
      ([input, output]) =>
        defer(() =>
          normalize({
            input: input,
            output: output,
            loudness: {
              normalization: 'peak',
              target: {
                input_i: -13,
                input_lra: 5,
                input_tp: -2.0
              }
            }
          })
        ).pipe(
          tap(() => fs.copyFileSync(output, input)),
          tap(() => fs.unlinkSync(output))
        ),
      5
    )
  )
  .subscribe({ error: e => console.error(e) })
