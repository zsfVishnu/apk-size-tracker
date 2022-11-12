function evaluateDiff(payload, currentSize) {
    const masterSize = payload.masterSize
    const diff = masterSize - currentSize
    return diff
}