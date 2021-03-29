
import { VNode } from './type'

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
  const ref = props.ref ?? null
  const key = props.key ?? null

  while (children.some(child => Array.isArray(child))) {
    children = children.flat()
  }

  return {
    type,
    ref,
    key,
    props: {
      ...props,
      children: children
        .map(child => typeof child === 'object'? child : createTextElement(child))
        .filter(e => e != null)
    }
  } as VNode
}

export function Fragment(props) {
  return props.children
}