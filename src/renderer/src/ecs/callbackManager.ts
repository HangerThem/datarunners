export class CallbackManager {
  private callbacks: Map<number, () => void>
  private nextId: number

  constructor() {
    this.callbacks = new Map()
    this.nextId = 1
  }

  registerCallback(callback: () => void): number {
    const id = this.nextId++
    this.callbacks.set(id, callback)
    return id
  }

  invokeCallback(id: number): void {
    const callback = this.callbacks.get(id)
    if (callback) {
      callback()
    }
  }
}
