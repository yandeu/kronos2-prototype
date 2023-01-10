import { ExtendedObject3D, THREE } from 'enable3d'
import { Direction } from './levels'
import { IGameScene } from './index'
import { UserDataImpl } from './types'

export class Player extends ExtendedObject3D implements UserDataImpl {
  isBlocked = false
  userData!: { dir: Direction; pos: { x: number; z: number }; lastPosition: THREE.Vector3 }
  isDying = false

  block() {
    this.isBlocked = true
  }

  constructor(scene: IGameScene, z: number = 0, x: number = 0) {
    super()

    scene.load.gltf('player').then(gltf => {
      this.position.setZ(z * 1.1)
      this.position.setX(x * 1.1)

      this.add(gltf.scene)
      scene.scene.add(this)

      const scale = 0.5
      this.position.y -= 0.25
      this.scale.set(scale, scale, scale)

      this.traverse(child => {
        if (child.isMesh) child.castShadow = child.receiveShadow = true
      })

      // store last position
      this.userData.lastPosition = this.position.clone()
      this.userData.pos = { x, z }

      // add animations
      scene.animationMixers.add(this.anims.mixer)
      gltf.animations.forEach(animation => {
        // console.log(animation.name)
        if (animation.name) this.anims.add(animation.name, animation)
      })
      // keep last frame of death animation
      this.anims.get('Death').clampWhenFinished = true

      this.anims.play('Idle')
    })
  }
}
