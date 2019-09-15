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

export const recId = (date: number, sayId: string, duration: number) =>
  `${date}__${sayId}__${duration}`
