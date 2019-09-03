import { connectWS, defaultWS } from 'common'

connectWS(defaultWS('control')).subscribe()
