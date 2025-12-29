export class CallbackManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private callbacks: Map<number, (...args: any[]) => void>
  private nextId: number

  constructor() {
    this.callbacks = new Map()
    this.nextId = 1
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerCallback = (callback: (...args: any[]) => void): number => {
    const id = this.nextId++
    this.callbacks.set(id, callback)
    return id
  }

  invokeCallback = (id: number, entityId?: number): void => {
    const callback = this.callbacks.get(id)
    if (!callback) return

    if (entityId !== undefined) {
      callback(entityId)
    } else {
      callback()
    }
  }

  isValidCallback = (id: number): boolean => {
    return this.callbacks.has(id)
  }

  unregisterCallback = (id: number): void => {
    this.callbacks.delete(id)
  }

  clearCallbacks = (): void => {
    this.callbacks.clear()
  }
}
