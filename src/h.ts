
import { VNode } from './type'

function createTextElement(nodeValue: string): VNode {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue,
      children: []
    }
  }
}

export function h(type, props, ...children): VNode {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
    }
  }
}