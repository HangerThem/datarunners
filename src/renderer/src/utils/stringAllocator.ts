type StringHandle = number

const StringPool: string[] = []
const Generations: number[] = []
const FreeList: number[] = []

const INDEX_BITS = 20

function makeHandle(index: number, gen: number): StringHandle {
  return (gen << INDEX_BITS) | index
}

function indexOf(h: StringHandle): number {
  return h & ((1 << INDEX_BITS) - 1)
}

function genOf(h: StringHandle): number {
  return h >> INDEX_BITS
}

export function allocString(value = ''): StringHandle {
  let index: number

  if (FreeList.length > 0) {
    index = FreeList.pop()!
    Generations[index]++
  } else {
    index = StringPool.length
    StringPool.push('')
    Generations.push(0)
  }

  StringPool[index] = value
  return makeHandle(index, Generations[index])
}

export function editString(handle: StringHandle, value: string): void {
  const index = indexOf(handle)
  const gen = genOf(handle)

  if (Generations[index] !== gen) {
    throw new Error('Stale string handle')
  }

  StringPool[index] = value
}

export function freeString(handle: StringHandle): void {
  const index = indexOf(handle)
  StringPool[index] = ''
  FreeList.push(index)
}

export function getString(handle: StringHandle): string {
  const index = indexOf(handle)
  const gen = genOf(handle)

  if (Generations[index] !== gen) {
    throw new Error('Stale string handle')
  }

  return StringPool[index]
}

export function clearStringPool(): void {
  StringPool.length = 0
  Generations.length = 0
  FreeList.length = 0
}

export function isValidStringHandle(handle: StringHandle): boolean {
  const index = indexOf(handle)
  const gen = genOf(handle)

  return index >= 0 && index < StringPool.length && Generations[index] === gen
}
