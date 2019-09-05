import { connectWS, tap } from 'common'

connectWS('control')
  .pipe(tap(x => console.log('CONNECTED', x)))
  .subscribe()

console.log('control')
