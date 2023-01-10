import { Direction } from './levels'
import { THREE } from 'enable3d'
import { Vec2 } from '../tween'

export interface UserData {
  pos: Vec2
  dir: Direction
  lastPosition?: THREE.Vector3 | undefined
}

export interface UserDataImpl {
  userData: UserData
}
