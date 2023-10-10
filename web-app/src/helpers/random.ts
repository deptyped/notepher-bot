import { nanoid } from 'nanoid'

export function generateRandomNumber(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateId(size: number = 8) {
  return nanoid(size)
}
