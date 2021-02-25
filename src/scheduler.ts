export function scheduleWork(cb) {
  if (window.requestIdleCallback) {
    return window.requestIdleCallback(cb)
  }

  const start = Date.now()
  return setTimeout(function () {
    cb({
      didTimeout: false,
      timeRemaining: function () {
        return Math.max(0, 50 - (Date.now() - start))
      }
    })
  }, 1)
}