import * as fs from 'fs'
import { resolve } from 'path'

const countLeftSpaces = (s: string) => {
  let c = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== ' ') {
      return c
    }
    c++
  }
  return c
}

let act: any = null
let person: any = null

const t = fs
  .readFileSync(resolve(__dirname, '../src/assets/text-raw.txt'), 'utf8')
  .split('\n')
  .map(l => l.trimRight())
  .filter(l => l)
  .map(l => [countLeftSpaces(l), l.trimLeft()] as [number, string])
  .reduce(
    (acc, n) => {
      const s = acc[act] && acc[act].scenes[acc[act].scenes.length - 1]
      const p = s && s.plot && s.plot[s.plot.length - 1]
      if (n[0] === 35) {
        if (n[1][0] === 'A') {
          act = n[1]
          person = null
          acc[act] = {
            prelude: [],
            scenes: []
          }
        } else if (n[1][0] === 'S') {
          acc[act].scenes.push({
            title: n[1],
            plot: []
          })
        }
      } else if (person === null && n[0] === 20) {
        acc[act].prelude.push(n[1])
      } else if (n[0] === 10) {
        person === null && (acc[act].prelude = acc[act].prelude.join(' '))
        person = n[1].replace(':', '')
      } else if (n[0] === 15) {
        if (p && p.who === person.replace(/ł/g, 'Ł')) {
          p.what += ' ' + n[1]
        } else {
          s.plot.push({
            type: 'say',
            who: person.replace(/ł/g, 'Ł'),
            what: n[1]
          })
        }
      } else if (n[0] === 20 || n[0] === 25) {
        if (p && p.type === 'desc') {
          p.what += ' ' + n[1]
        } else {
          s.plot.push({
            type: 'desc',
            what: n[1]
          })
        }
      } else {
        console.log('WTF', n)
      }
      return acc
    },
    {} as any
  )

fs.writeFileSync(
  resolve(__dirname, '../src/assets/parsed.json'),
  JSON.stringify(t, null, 2)
    .replace(/ŁUKASZ/g, 'LEON')
    .replace(/Łukasz/g, 'Leon')
    .replace(/NELA\(GŁOS W TEL.\)/g, 'NELA (GŁOS W TEL.)')
)
