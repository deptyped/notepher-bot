export const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0
