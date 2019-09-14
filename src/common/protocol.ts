import { Role } from './names'

interface Protocol {
  
}

export type ServerToControl = {
  type: 'conn',
  payload: Role[]
}

export type ActorToScreen = {
  type: 'selfie',
  payload: string
}
