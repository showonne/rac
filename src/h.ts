
import { VNode } from './type';

function createTextElement(nodeValue: string): VNode {
  return {
    type: 'text',
    props: {
      nodeValue,
      children: []
    }
  }
}

export function h(type, props, ...children): VNode {
  props = props || {}
  const ref = props.ref || null
  return {
    type,
    ref,
    props: {
      ...props,
      children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
    }
  } as VNode
}

export function Fragment(props) {
  return props.children
}