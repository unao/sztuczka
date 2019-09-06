import { connectWS, tap, render } from 'common'
import * as play from '../assets/parsed.json'

connectWS('control')
  .pipe(
    tap(x => console.log('CONNECTED', x))
    //    tap(() => render(JSON.stringify(play)))
  )
  .subscribe()

console.log('control')
