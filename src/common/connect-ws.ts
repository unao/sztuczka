import { Observable } from 'rxjs'
import { Role } from './names'
import { withProtocol } from './protocol'

export const url = (role = '') =>
  `wss://${window.location.hostname}:${parseInt(window.location.port, 10) +
    1}/ws${role && `?role=${role}`}`

export const connectWS = (role: Role) =>
  Observable.create((obs: any) => {
    const ws = new WebSocket(url(role))
    ws.onopen = () => obs.next(withProtocol(ws))

    ws.onclose = x => obs.error(x)
    return () => ws.close()
  }) as Observable<ReturnType<typeof withProtocol>>
