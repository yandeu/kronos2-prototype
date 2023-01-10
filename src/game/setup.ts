import { IGameScene } from './index'
import { THREE } from 'enable3d'

export const setup = async (scene: IGameScene) => {
  const encoding = THREE.sRGBEncoding

  const { lights } = await scene.warpSpeed('-ground', '-orbitControls', '-sky')
  lights?.directionalLight.position.set(10, 20, 10)
  // @ts-ignore
  scene.camera.fov = 30
  scene.scene.background = new THREE.Color('#87d1ff') //.convertSRGBToLinear()

  // camera and render settings
  scene.renderer.outputEncoding = encoding
  scene.renderer.toneMapping = THREE.ACESFilmicToneMapping

  const zoom = 10
  scene.camera.position.set(-zoom, zoom * 0.9, zoom)
  const lookAt = new THREE.Vector3()
  scene.camera.lookAt(lookAt)

  scene.center.set(0, 0, 0)
  const initialPosition = scene.camera.position.clone()

  const resize = () => {
    const newWidth = window.innerWidth
    const newHeight = window.innerHeight

    const ratio = window.innerHeight / window.innerWidth

    if (ratio > 1) {
      const tmp = initialPosition.clone()
      tmp.multiplyScalar(ratio)
      scene.camera.position.copy(tmp)
      scene.camera.position.x += scene.center.x
      scene.camera.position.z += scene.center.z
    }

    const dpi = Math.min(2, window.devicePixelRatio)
    scene.renderer.setSize(newWidth, newHeight)
    scene.renderer.setPixelRatio(dpi)

    // @ts-ignore
    scene.camera.aspect = newWidth / newHeight
    scene.camera.updateProjectionMatrix()
  }

  window.onresize = resize
  resize()
}
