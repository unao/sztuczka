import * as play from '../assets/parsed.json'
import { BehaviorSubject } from 'rxjs'

export type Plot = typeof plot
export type Say = Plot extends Array<infer U> ? U : never

const txt = play['AKT I'].scenes.concat(play['AKT II'].scenes)
const plot = txt.reduce((acc, t) => acc.concat(t.plot), [] as Array<{
  type: string
  who?: string
  what: string
  id: string
}>)

const l = plot.length
const progress = plot.reduce(
  (acc, n, idx) => {
    acc[n.id] = idx / l
    return acc
  },
  {} as { [K in string]: number }
)

const sceneTitles = txt.map(s => s.title)

const ps = new URLSearchParams(location.search)

const s = parseInt(ps.get('s') || '1', 10) - 1
const scene = new BehaviorSubject(txt.find((_, idx) => idx === s) || txt[0])

const showScreen = ps.has('screen')

export const state = {
  txt,
  plot,
  missing: (ps.get('m') || '').toUpperCase().split(','),
  progress,
  sceneTitles,
  scene,
  showScreen,

  updateScene: (idx: number) => {
    ps.set('s', `${idx + 1}`)
    history.replaceState(
      null,
      'G25 | CONTROL',
      window.location.pathname + `?${ps.toString()}`
    )
    scene.next(txt[idx])
  }
}
state.updateScene(s)
