import * as fs from 'fs'
import { resolve } from 'path'
import { hash } from '../common/utils'

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

const sayId = (sceneIdx: number, who: string, what: string) =>
  `${sceneIdx}_${hash(who + what)}`

const t = fs
  .readFileSync(resolve(__dirname, './text-raw.txt'), 'utf8')
  .split('\n')
  .map(l => l.trimRight())
  .filter(l => l)
  .map(l => [countLeftSpaces(l), l.trimLeft()] as [number, string])
  .reduce(
    (acc, n) => {
      const s = acc[act] && acc[act].scenes[acc[act].scenes.length - 1]
      const p = s && s.plot && s.plot[s.plot.length - 1]
      const id = (who: string, what: string) =>
        sayId(
          acc[act].scenes.length - 1 + (act === 'AKT II' ? 23 : 0),
          who,
          what
        )
      const msg = (line: string) => {
        const [type, kind, who, other, body, variant] = line.split('_')
        console.log(type, kind, who, other, body, variant)
        return {
          id: id(who, line),
          type,
          who,
          what: `${type}:${kind} -- ${who}${body ? ` -- ${body}` : ''}`,
          kind,
          other: other.split('!')[0] || '',
          number: other.split('!')[1] || '',
          body: body || '',
          variant: variant || ''
        }
      }
      const call = (line: string) => {
        const [type, who, other] = line.split('_')
        console.log(type, who, other)
        return {
          id: id(who, line),
          type,
          who,
          what: `${type} -- ${who} -- ${other}`,
          other: other.split('!')[0] || '',
          number: other.split('!')[1] || ''
        }
      }
      const audio = (line: string) => {
        const [type, url] = line.split('_')
        console.log(type, url)
        return {
          id: id('audio', line),
          type,
          who: undefined,
          what: `${type} -- ${url}`,
          url
        }
      }
      const selfie = (line: string) => {
        const [type, who] = line.split('_')
        console.log(type, who)
        return {
          id: id('selfie', line),
          type,
          who: who,
          what: `${type} -- ${who}`
        }
      }
      const aux = (line: string) => {
        const [_, type] = line.split('_')
        return {
          id: id(type, line),
          type,
          who: '',
          what: `${type}`
        }
      }
      const img = (line: string) => {
        const [_, url] = line.split('_')
        return {
          id: id('img', line),
          type: 'img',
          who: '',
          what: url || 'image-stop'
        }
      }
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
        if (p && p.who === person) {
          p.what += ' ' + n[1]
          p.id = id(person, p.what)
        } else {
          s.plot.push({
            type: 'say',
            who: person,
            what: n[1],
            id: id(person, n[1])
          })
        }
      } else if (n[0] === 20 || n[0] === 25) {
        if (p && p.type === 'desc') {
          p.what += ' ' + n[1]
        } else {
          if (n[1].startsWith('msg')) {
            s.plot.push(msg(n[1]))
          } else if (n[1].startsWith('call')) {
            s.plot.push(call(n[1]))
          } else if (n[1].startsWith('audio')) {
            s.plot.push(audio(n[1]))
          } else if (n[1].startsWith('selfie')) {
            s.plot.push(selfie(n[1]))
          } else if (n[1].startsWith('aux')) {
            s.plot.push(aux(n[1]))
          } else if (n[1].startsWith('img')) {
            s.plot.push(img(n[1]))
          } else {
            s.plot.push({
              type: 'desc',
              what: n[1],
              id: ''
            })
          }
        }
      } else {
        console.log('WTF', n)
      }
      return acc
    },
    {} as any
  )

fs.writeFileSync(
  resolve(__dirname, '../assets/parsed.json'),
  JSON.stringify(t, null, 2)
)
