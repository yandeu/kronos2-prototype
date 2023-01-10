import { GameScene } from './game'
import { Project } from 'enable3d'

const body = document.querySelector('body') as HTMLBodyElement
body.style.margin = '0px'
body.style.overflow = 'hidden'

new Project({ scenes: [GameScene], antialias: true })
