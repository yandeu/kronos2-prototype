export type Vec2 = {
  x: number
  z: number
}

export class Tween {
  private tmp: Vec2
  private delta: Vec2
  private step: Vec2 = { z: 0, x: 0 }
  private frames: number = 0
  private _finished: boolean = false
  private _delay: number = 0
  private _useGravity: boolean = false
  private _gravity: number = 0
  private _velocity = 0

  private updateCallback!: (value: Vec2) => void
  private completeCallback!: () => void

  constructor(private from: Vec2, private to: Vec2 = { z: 0, x: 0 }) {
    this.delta = { z: to.z - from.z, x: to.x - from.x }
    this.tmp = { z: from.z, x: from.x }
  }

  get finished() {
    return this._finished
  }

  start(frames: number): this {
    this.frames = frames
    this.step = { x: this.delta.x / frames, z: this.delta.z / frames }
    return this
  }

  delay(frames: number): this {
    this._delay = frames
    return this
  }

  onUpdate(callback: (value: Vec2) => void): this {
    this.updateCallback = callback
    return this
  }

  onComplete(callback: () => void): this {
    this.completeCallback = callback
    return this
  }

  gravity(g = -9.81): this {
    this._gravity = g
    this._useGravity = true
    return this
  }

  update(): void {
    if (this._finished) return

    if (this._delay > 0) {
      this._delay--
      return
    }

    if (this.frames <= 0) {
      if (this.completeCallback) this.completeCallback()
      this.destroy()
      return
    }
    this.frames--
    if (!this._useGravity) {
      this.tmp = { x: this.tmp.x + this.step.x, z: this.tmp.z + this.step.z }
    }
    // use gravity
    else {
      this._velocity += this._gravity * (1 / 60) ** 2
      this.tmp.z += this._velocity
    }
    this.updateCallback(this.tmp)
  }

  destroy() {
    this._finished = true
    // @ts-ignore
    this.completeCallback = undefined
    // @ts-ignore
    this.updateCallback = undefined
  }
}
