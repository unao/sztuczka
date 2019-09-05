import { Observable } from 'rxjs'

export const defaultWS = (role = '') =>
  `wss://${window.location.hostname}:${parseInt(window.location.port, 10) +
    1}/ws${role && `?role=${role}`}`

export const connectWS = (url = defaultWS()) =>
  Observable.create((obs: any) => {
    const ws = new WebSocket(url)
    ws.onopen = () => obs.next(ws)

    ws.onclose = x => obs.error(x)
    return () => ws.close()
  }) as Observable<WebSocket>
