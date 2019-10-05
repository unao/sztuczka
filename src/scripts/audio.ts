import { actors, Actor } from '../common/names'
import * as play from '../assets/parsed.json'
import { of, from, bindNodeCallback } from 'rxjs'
import { mergeMap, tap } from 'rxjs/operators'
import { resolve } from 'path'
import * as fs from 'fs'
import { exec } from 'child_process'

const exe = bindNodeCallback(exec)

const txt = play['AKT I'].scenes.concat(play['AKT II'].scenes)
const plot = txt.reduce(
  (acc, t) => acc.concat((t as any).plot.filter((t: any) => t.type === 'say')),
  [] as Array<{
    type: string
    who?: string
    what: string
    id: string
  }>
)

const inAssets = (p: string) => resolve(__dirname, '../assets', p)

const audioList = (a: Actor) =>
  plot
    .filter(
      (_, idx) =>
        plot[idx].who!.startsWith(a) ||
        (plot[idx + 1] && plot[idx + 1].who!.startsWith(a)) ||
        (plot[idx + 2] && plot[idx + 2].who!.startsWith(a)) ||
        (plot[idx - 1] && plot[idx - 1].who!.startsWith(a))
    )
    .map(p =>
      inAssets(
        p.who!.endsWith('(GŁOS W TEL.)')
          ? `voices/${p
              .who!.replace(' (GŁOS W TEL.)', '')
              .replace(/\s/g, '_')
              .toLowerCase()}.webm`
          : `recs/${p.who === 'NELA TEL' ? 'NELA' : p.who}/${p.id}.webm`
      )
    )
    .map(p => {
      if (!fs.existsSync(p)) {
        console.warn(p)
      }
      return `file '${p}'`
    })
    .join('\n')

const combine = (a: Actor) => {
  const l = inAssets(`audio/${a}.list`)
  const w = inAssets(`audio/${a}.webm`)
  const o = inAssets(`audio/${a}.mp3`)
  return of(audioList(a)).pipe(
    tap(li => fs.writeFileSync(l, li, 'utf8')),
    mergeMap(() => exe(`ffmpeg -y -f concat -safe 0 -i ${l} -c copy ${w}`)),
    mergeMap(() => exe(`ffmpeg -y -i ${w} ${o}`))
  )
}

from(actors.concat(['NELA' as Actor]))
  .pipe(mergeMap(combine))
  .subscribe()

// from(fs.readdirSync(inAssets('voices')))
//   .pipe(
//     tap(x => console.log(x)),
//     mergeMap(x =>
//       exe(`ffmpeg -i ${inAssets(`voices/${x}`)} ${inAssets(`voices/${x.replace('mp3', 'webm')}`)}`))
//   )
//   .subscribe()
