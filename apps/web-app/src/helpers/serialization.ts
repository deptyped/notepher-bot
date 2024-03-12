export function serialize<T>(data: T) {
  return JSON.stringify(data)
}

export function deserialize<T>(data: string): T {
  return JSON.parse(data)
}
