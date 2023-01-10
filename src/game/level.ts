import { Direction, levels as L, StoneType } from './levels'
import { ExtendedObject3D, THREE } from 'enable3d'
import { Tween, Vec2 } from '../tween'
import { COLOR } from './colors'
import { IGameScene } from './index'
import type { Level as IL } from './levels'
import { Player } from './player'

const loadLevel = (index: number) => {
  const levels = JSON.parse(JSON.stringify(L))
  return levels[index % levels.length]
}

export class Level {
  private _start: Array<number>
  private _level: IL
  public platforms: ExtendedObject3D[] = []

  constructor(private scene: IGameScene, level: number) {
    this._level = loadLevel(level)

    const start = this.findPlatformByType('S')
    if (!start) throw new Error('No start position "S" found!')

    this.platforms.push(...this.addPlatforms())

    this._start = start
  }

  isSpecificPlatform = (z: number, x: number, p: StoneType): boolean => {
    if (this.getTileByPos(z, x) === p) return true
    return false
  }

  get level() {
    return this._level
  }

  get stones() {
    return this._level.stones
  }

  get start() {
    return this._start
  }

  getTileByPos(z: number, x: number) {
    try {
      const platform = this.stones[z][x]
      if (platform) return platform
    } catch {
      return null
    }
    return null
  }

  findPlatformByType(type: StoneType): Array<number> | null {
    let found: Array<number> | null = null

    this.iterateLevel((z, x) => {
      if (this.stones[z][x] === type) found = [z, x]
    })
    return found
  }

  isPlatform(z: number, x: number): boolean {
    try {
      if (this.stones[z][x] && this.stones[z][x] !== '_') return true
    } catch {
      return false
    }
    return false
  }

  canMove(): boolean {
    const { pos } = this.scene.player.userData
    return (
      this.isPlatform(pos.z + 1, pos.x + 0) ||
      this.isPlatform(pos.z + -1, pos.x + 0) ||
      this.isPlatform(pos.z + 0, pos.x + 1) ||
      this.isPlatform(pos.z + 0, pos.x + -1)
    )
  }

  moveToNextTile(obj: Player, ahead = 1): void {
    const { z, x } = this.getPosAhead(obj, ahead)
    obj.userData.pos = { z, x }

    const tween = new Tween(obj.position, { x: x * 1.1, z: z * 1.1 })
      .onUpdate(vec => {
        obj.position.x = vec.x
        obj.position.z = vec.z
      })
      .start(20 * ahead)

    this.scene.tweens.add(tween)
  }

  getTileAhead(obj: Player, ahead = 1): StoneType | null {
    const pos = this.getPosAhead(obj, ahead)
    if (!pos) return null
    const stoneType = this.scene.level.getTileByPos(pos.z, pos.x)
    return stoneType
  }

  getPosAhead(obj: Player, ahead = 1): Vec2 {
    const { x, z } = obj.userData.pos

    switch (obj.userData.dir) {
      case Direction.LEFT:
        return { x: x - ahead, z }
      case Direction.RIGHT:
        return { x: x + ahead, z }
      case Direction.UP:
        return { x: x, z: z - ahead }
      case Direction.DOWN:
        return { x: x, z: z + ahead }
    }
  }

  isValidNewPosition(z: number, x: number): boolean {
    const { pos } = this.scene.player.userData
    try {
      if (this.stones[pos.z + x][pos.x + z] === '_') return false
      if (!this.stones[pos.z + x][pos.x + z]) return false
    } catch {
      return false
    }

    pos.z = pos.z + x
    pos.x = pos.x + z

    return true
  }

  addPlatforms(): ExtendedObject3D[] {
    const platforms: ExtendedObject3D[] = []
    const level = this.level.stones

    this.iterateLevel((z, x) => {
      if (level[z][x] !== '_') {
        let color: THREE.Color
        switch (level[z][x]) {
          case 'Y':
            color = COLOR.YELLOW
            break
          case '8':
            color = COLOR.GRAY
            break
          default:
            color = COLOR.LIGHT_GREEN
            break
        }
        const stone = this.scene.add.box({ x: x * 1.1, y: -0.5, z: z * 1.1, height: 0.5 }, { phong: { color } })
        stone.name = `stone_${x}_${z}`
        platforms.push(stone)
      }
    })

    return platforms
  }

  iterateLevel(callback: (z: number, x: number) => void) {
    for (let z = 0; z < this.level.stones.length; z++) {
      for (let x = 0; x < this.level.stones[z].length; x++) {
        callback(z, x)
      }
    }
  }
}
