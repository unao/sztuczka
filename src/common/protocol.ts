import { Role } from './names'

export type ServerToControl = {
  type: 'conn',
  payload: Role[]
}
