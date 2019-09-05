import { Observable } from 'rxjs'
import { Actor } from './names'

export const url = (role = '') =>
  `wss://${window.location.hostname}:${parseInt(window.location.port, 10) +
    1}/ws${role && `?role=${role}`}`

export const connectWS = (role: Actor | 'control' | 'screen') =>
  Observable.create((obs: any) => {
    const ws = new WebSocket(url(role))
    ws.onopen = () => obs.next(ws)

    ws.onclose = x => obs.error(x)
    return () => ws.close()
  }) as Observable<WebSocket>
