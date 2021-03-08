const isEvent = key => key.startsWith('on')

export function updateDom(dom, oldProps, newProps) {

  for (let key in { ...oldProps, ...newProps }) {
    if (key === 'children') {
      continue
    }
    const oldValue = oldProps[key]
    const newValue = newProps[key]
    if (isEvent(key)) {
      const eventType = key.slice(2).toLowerCase()
      if (oldValue) {
        dom.removeEventListener(eventType, oldValue)
      }
      if (newValue) {
        dom.addEventListener(eventType, newValue)
      }
    } else if (key === 'style') {
      if (typeof newValue === 'string') {
        (dom as HTMLElement).style.cssText = newValue
      } else {
        for (let styleName in { ...oldValue, ...newValue }) {
          dom.style[styleName] = newValue[styleName] || ''
        }
      }
    } else if (!(dom instanceof SVGElement)) {
      // for text node
      dom[key] = newValue || ''
    } else {
      dom.setAttribute(key, newValue || null)
    }
  }
}

export function createDom(fiber) {
  const dom = fiber.type === 'text'
    ? document.createTextNode('')
    : fiber.isSVG ? document.createElementNS('http://www.w3.org/2000/svg', fiber.type) : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)

  return dom
}