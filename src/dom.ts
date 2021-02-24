const isEvent = key => key.startsWith('on')
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)
const isProp = key => key !== 'children' && !isEvent(key)


export function updateDom(dom, prevProps, nextProps) {
  Object.keys(prevProps)
    .filter(isProp)
    .filter(isGone(prevProps, nextProps))
    .forEach(key => {
      dom[key] = ''
    })

  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => {
      !(key in nextProps) || isNew(prevProps, nextProps)(key)
    })
    .forEach(key => {
      const eventType = key.toLowerCase().substring(2)
      dom.removeEventListener(eventType, prevProps[key])
    })

  Object.keys(nextProps)
    .filter(isProp)
    .filter(isNew(prevProps, nextProps))
    .forEach(key => {
      dom[key] = nextProps[key]
    })

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(key => {
      const eventType = key.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[key])
    })
}

export function createDom(fiber) {
  const dom = fiber.type === 'text'
    ? document.createTextNode('')
    : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)

  return dom
}