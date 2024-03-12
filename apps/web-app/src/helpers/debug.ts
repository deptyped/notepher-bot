export const createLine = (title: string, color: string) => {
  const line = document.createElement('div')
  line.textContent = title
  line.style.background = color
  line.style.position = 'absolute'
  line.style.height = '3px'
  line.style.width = '100%'

  document.body.insertBefore(line, document.body.firstChild)
  return {
    setPosition: (offset: number) => {
      line.style.top = `${offset}px`
    }
  }
}
