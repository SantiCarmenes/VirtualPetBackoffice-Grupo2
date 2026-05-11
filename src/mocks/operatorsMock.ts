export const mockOperators = [
  { id: 'op-001', name: 'John Smith' },
  { id: 'op-002', name: 'Sarah Johnson' },
  { id: 'op-003', name: 'Michael Brown' },
]

export const mockOperatorRepository = {
  getOperators() {
    return [...mockOperators]
  },
}
