import { Fiber, Props, DOMNode } from './type'
const isEvent = key => key.startsWith('on')

export function updateDom(dom: DOMNode, oldProps: Props, newProps: Props): void {

  for (const key in { ...oldProps, ...newProps }) {
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
        for (const styleName in { ...oldValue, ...newValue }) {
          (dom as HTMLElement).style[styleName] = newValue[styleName] || ''
        }
      }
    } else if (!(dom instanceof SVGElement)) {
      // for text node
      dom[key] = newValue ?? ''
    } else {
      dom.setAttribute(key, newValue || null)
    }
  }
}

export function createDom(fiber: Fiber): DOMNode {
  const dom = fiber.type === 'text'
    ? document.createTextNode('')
    : fiber.isSVG ? document.createElementNS('http://www.w3.org/2000/svg', fiber.type as string) : document.createElement(fiber.type as string)

  updateDom(dom, {} as Props, fiber.props)

  return dom           
}