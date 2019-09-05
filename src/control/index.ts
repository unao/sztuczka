import { connectWS, defaultWS, tap } from 'common'

connectWS(defaultWS('control'))
  .pipe(tap(x => console.log('CONNECTED', x)))
  .subscribe()

console.log('control')
