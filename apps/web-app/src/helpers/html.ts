export function stripTags(content: string) {
  return content.replace(/(<([^>]+)>)/gi, ' ') || ''
}
