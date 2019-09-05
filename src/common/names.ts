export type Actor = typeof actors extends Array<infer K> ? K : never

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
