import { Role } from './names'
import { Observable, merge, fromEvent, EMPTY } from 'rxjs'
import { map, groupBy, mergeMap } from 'rxjs/operators'

export type ProtocolHandler = Partial<
  {
    [K in keyof Protocol]: (m: Observable<Protocol[K]>) => Observable<unknown>
  }
>

export type Message<K extends keyof Protocol> = {
  type: K
  payload: Protocol[K]
}

interface MSG {
  type: 'sms' | 'email' | 'whatsup' | 'timer'
  from: string
  number: string
  msg: string
}

interface Call {
  other: string
  number: string
}

interface Protocol {
  conn: Role[]
  img: {
    url: string
    duration: number
  }
  txt: string
  callGet: Call
  callStart: Call
  callEnd: null
  msgGet: MSG
  msgShow: MSG
}

const unwrap = <K extends keyof Protocol>(m: string) =>
  JSON.parse(m) as Message<K>

export const withProtocol = (ws: {
  send: (m: string) => void
  // on: (m: string, cb: (m: string) => void) => void
  // off: (m: string) => void
}) => {
  return {
    send: <K extends keyof Protocol>(
      k: K,
      p: Protocol[K],
      to?: Role | Role[]
    ) => {
      ws.send(
        JSON.stringify({
          type: k,
          payload: p,
          to
        })
      )
    },
    handle: (h: ProtocolHandler) =>
      fromEvent<{ data: string }>(ws as any, 'message').pipe(
        map(m => unwrap(m.data)),
        groupBy(d => d.type),
        mergeMap(ms =>
          h[ms.key] ? h[ms.key]!(ms.pipe(map(m => m.payload)) as any) : EMPTY
        )
      )
  }
}
