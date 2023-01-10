import { IGameScene } from './index'

export const restartButton = (scene: IGameScene) => {
  let restartBtn = document.getElementById('restart')
  if (!restartBtn) {
    restartBtn = document.createElement('button')
    document.body.append(restartBtn)
  }
  restartBtn.innerText = 'restart'
  restartBtn.style.position = 'absolute'
  restartBtn.style.left = '24px'
  restartBtn.style.top = '24px'
  restartBtn.style.fontSize = '18px'
  restartBtn.style.padding = '4px 8px'
  restartBtn.addEventListener('click', () => {
    scene.restart(0)
  })
}
