import { Role } from './names'

export type ServerToControl = {
  type: 'conn',
  payload: Role[]
}

export type ActorToScreen = {
  type: 'selfie',
  payload: string
}
