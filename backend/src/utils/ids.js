export function createId(prefix) {
  return `${prefix}-${Date.now()}`;
}
