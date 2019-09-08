import { hash } from './utils'

export type Actor = typeof actors extends ReadonlyArray<infer K> ? K : never
export type Role = Actor | 'control' | 'screen'

export const actors = [
  'ANIELA',
  'CZAREK',
  'EWA',
  'ROBERT',
  'KAROLINA',
  'LEON',
  'KRYSTIAN'
  // 'NELA'
] as const

export const sayId = (sceneIdx: number, who: string, what: string) =>
  `${sceneIdx}_${hash(who + what)}`
