let deadline = 0
const threshold = 5

const queue = []
const unit = []

const getTime = () => performance.now()

const postMessage = (() => {
  const cb = () => unit.splice(0, unit.length).forEach(c => c())

  if (typeof MessageChannel !== 'undefined') {
    const { port1, port2 } = new MessageChannel()
    port1.onmessage = cb
    return () => port2.postMessage(null)
  }
  return () => setTimeout(cb)
})()

const flushWork = () => {
  deadline = getTime() + threshold
  let job = queue[0]
  while (job && !shouldYield()) {
    const { cb } = job
    const next = cb()
    if (next) {
      job.cb = next
    } else {
      queue.shift()
    }
    job = queue[0]
  }
  job && schedule(flushWork)
}

export function schedule(cb) {
  unit.push(cb)
  postMessage()
}

export function scheduleWork(cb) {
  const job = { cb }
  queue.push(job)
  schedule(flushWork)
}

export const shouldYield = () => (navigator as any)?.scheduling?.isInputPending() || getTime() > deadline