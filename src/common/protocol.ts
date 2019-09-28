import { Role, Actor } from './names'
import { Observable, fromEvent, EMPTY, Subject } from 'rxjs'
import { map, groupBy, mergeMap, tap } from 'rxjs/operators'

export type Send = ReturnType<typeof withProtocol>['send']

export type ProtocolHandler = (
  gs: Observable<Message<keyof Protocol>>
) => Partial<
  {
    [K in keyof Protocol]: (m: Observable<Protocol[K]>) => Observable<unknown>
  }
>

export type Message<K extends keyof Protocol = keyof Protocol> = {
  type: K
  payload: Protocol[K]
}

interface MSGBase {
  who: Actor
  kind: 'sms' | 'email' | 'whatsup' | 'timer'
  variant: string
}

interface MSG extends MSGBase {
  other: string
  number: string
  body: string
}

interface Call {
  who: Actor
  other: string
  number: string
}

export interface Protocol {
  conn: Role[]
  img: {
    url: string
    duration: number
  }
  audioStart: {
    url: string
  }
  audioStop: null
  txt: string
  callGet: Call
  callStart: Call
  callLoud: Call
  callEnd: null
  msgGet: MSGBase
  msgShow: MSG
  selfieStart: null
  selfieStop: null
}

const unwrap = <K extends keyof Protocol>(m: string) =>
  JSON.parse(m) as Message<K>

export const withProtocol = (ws: { send: (m: string) => void }) => {
  return {
    send: <K extends keyof Protocol>(k: K, p: Protocol[K], to?: Role) =>
      ws.send(
        JSON.stringify({
          type: k,
          payload: p,
          to
        })
      ),
    handle: (hc: ProtocolHandler) => {
      const s = new Subject<Message<keyof Protocol>>()
      return fromEvent<{ data: string }>(ws as any, 'message').pipe(
        map(m => unwrap(m.data)),
        tap(x => s.next(x)),
        groupBy(d => d.type),
        mergeMap(ms => {
          const h = hc(s)
          return h[ms.key]
            ? h[ms.key]!(ms.pipe(map(m => m.payload)) as any)
            : EMPTY
        })
      )
    }
  }
}
