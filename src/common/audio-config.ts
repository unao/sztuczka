const def = [2000, 2000] as const

const configs: { [K in string]: readonly [number, number] } = {
  'call/CZAREK.mp3': def,
  'sound/telefony-telefony.mp3': def
}

export const getAudioConfig = (s: string) => {
  const c = configs[s]
  if (c) {
    return {
      smoothStart: c[0],
      smoothEnd: c[1]
    }
  } else {
    return null
  }
}
