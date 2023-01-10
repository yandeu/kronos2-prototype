import { ExtendedObject3D, Scene3D, THREE } from 'enable3d'
import { Direction } from './levels'
import { Level } from './level'
import { Player } from './player'
import { Tap } from '@yandeu/tap'
import { Tween } from '../tween'
import { restartButton } from './restartButton'
import { setup } from './setup'

export interface IGameScene extends Scene3D {
  player: Player
  tweens: Set<Tween>
  tap: Tap
  level: Level
  center: THREE.Vector3
}

export class GameScene extends Scene3D implements IGameScene {
  player!: Player
  tweens: Set<Tween> = new Set()
  tap!: Tap
  level!: Level
  center: THREE.Vector3 = new THREE.Vector3()
  currentLevel = 0

  init(data: { level?: number }) {
    if (!data) return

    const { level } = data
    if (level) this.currentLevel = level
  }

  preload() {
    restartButton(this)
    this.load.preload('player', './models/quaternius/Tribal.gltf')
  }

  async create() {
    await setup(this)
    this.tap = new Tap(this.canvas)

    // create level
    this.level = new Level(this, this.currentLevel)
    const { z: startZ, x: startX } = this.level.start

    // keep track of the center
    this.center.set(startX * 1.1, 0, startZ * 1.1)

    this.camera.position.x += startX * 1.1
    this.camera.position.z += startZ * 1.1

    // add player
    this.player = new Player(this, startZ, startX)

    // handle inputs
    let pos = { x: 0, y: 0 }
    this.tap.on.down(({ position, event }) => {
      pos = { ...position }
    })
    this.tap.on.up(async ({ position, event }): Promise<void> => {
      if (this.player.anims.current === 'Run') return
      if (this.player.isBlocked) return

      const deltaX = position.x - pos.x
      const deltaY = position.y - pos.y

      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) return

      const angleRadians = Math.atan2(deltaX, deltaY)
      const angleNormalized = (angleRadians + Math.PI) / (2 * Math.PI)
      const coords = { x: this.player.position.x, z: this.player.position.z }

      const { z: posZ, x: posX } = this.player.userData.pos

      // right
      if (angleNormalized > 0.75) {
        this.player.rotation.y = Math.PI * 0.5
        this.player.userData.dir = Direction.RIGHT
        if (!this.level.isValidNewPosition(1, 0)) return
        coords.x += 1.1
      }
      // bottom
      else if (angleNormalized > 0.5) {
        this.player.rotation.y = Math.PI * 2
        this.player.userData.dir = Direction.DOWN
        if (!this.level.isValidNewPosition(0, 1)) return
        coords.z += 1.1
      }
      // left
      else if (angleNormalized > 0.25) {
        this.player.rotation.y = Math.PI * 1.5
        this.player.userData.dir = Direction.LEFT
        if (!this.level.isValidNewPosition(-1, 0)) return
        coords.x -= 1.1
      }
      // top
      else {
        this.player.rotation.y = Math.PI
        this.player.userData.dir = Direction.UP
        if (!this.level.isValidNewPosition(0, -1)) return
        coords.z -= 1.1
      }

      // get the stone the player is on
      const stone = {
        type: this.level.stones[posZ][posX],
        object: this.level.platforms.find(s => s.name === `stone_${posX}_${posZ}`) as ExtendedObject3D
      }

      if (stone.type === 'Y') {
        // nothing here yet
      } else if (stone.type === '0' || stone.type === 'S') {
        // set falling stone to be empty
        this.level.stones[posZ][posX] = '_'

        // make stone falling
        if (stone.object) {
          const tween = new Tween({ x: 0, z: stone.object.position.y })
            .onUpdate(vec => {
              stone.object.position.setY(vec.z)
            })
            .onComplete(() => {
              this.destroy(stone.object)
            })
            .delay(15)
            .gravity(-20)
            .start(300)
          this.tweens.add(tween)
        }
      }

      // move the player
      const tween = new Tween({ x: this.player.position.x, z: this.player.position.z }, coords)
        .onUpdate(vec => {
          this.player.userData.lastPosition = this.player.position.clone()
          this.player.position.setX(vec.x)
          this.player.position.setZ(vec.z)
        })
        .onComplete(() => {
          if (this.player.isBlocked) {
            this.player.anims.play('Idle', 100)
            return
          }

          const isOnGoal = this.level.isSpecificPlatform(this.player.userData.pos.z, this.player.userData.pos.x, 'Y')
          const hasRemainingStones = this.level.stones.flat().find(s => s === '0')
          const playerCanMove = this.level.canMove()

          const gameOver = () => {
            this.player.anims.play('No', 100, true)
            this.restart(3000)
          }
          const nextLevel = () => {
            this.player.anims.play('Wave', 50)
            this.currentLevel++
            this.restart(2000)
          }

          if (isOnGoal && !hasRemainingStones) nextLevel()
          else if (isOnGoal && !playerCanMove) gameOver()
          else if (isOnGoal) this.player.anims.play('Idle', 100)
          else if (!playerCanMove) gameOver()
          else this.player.anims.play('Idle', 100)
        })
        .start(20)
      this.tweens.add(tween)

      this.player.anims.play('Run', 50)
    })
  }

  async restart(delay: number = 800) {
    this.tap.destroy()

    setTimeout(async () => {
      this.tweens.forEach(t => t.destroy())
      this.tweens.clear()
      await super.restart({ level: this.currentLevel })
    }, delay)
  }

  update(time: number, delta: number) {
    const posPrev = this.player.position.clone()

    this.tweens.forEach(t => {
      t.update()
      if (t.finished) {
        setTimeout(() => {
          this.tweens.delete(t)
        })
      }
    })

    const posCurr = this.player.position.clone()

    const deltaX = posCurr.x - posPrev.x
    const deltaZ = posCurr.z - posPrev.z

    const radius = 2.5
    const isPlayerInCenter =
      Math.pow(this.player.position.x - this.center.x, 2) + Math.pow(this.player.position.z - this.center.z, 2) <
      Math.pow(radius, 2)

    // move the camera and the game center to follow the player
    if (!isPlayerInCenter && this.center) {
      this.camera.position.x += deltaX
      this.camera.position.z += deltaZ
      this.center.x += deltaX
      this.center.z += deltaZ
    }
  }
}
