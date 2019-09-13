import * as play from '../assets/parsed.json'
import { BehaviorSubject } from 'rxjs'

export type Plot = typeof plot

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

const scene = new BehaviorSubject(
  sceneTitles.find(t => t === ps.get('s')) || 'SCENA 1'
)

export const state = {
  txt,
  plot,
  progress,
  sceneTitles,
  scene,

  updateScene: (s: string) => {
    ps.set('s', s)
    history.replaceState(
      null,
      s,
      window.location.pathname + `?${ps.toString()}`
    )
    scene.next(s)
  }
}
