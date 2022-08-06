
import { VNode, Props } from './type'

function createTextElement(nodeValue: string): VNode {
  return {
    type: 'text',
    props: {
      nodeValue,
      children: []
    }
  }
}

export function h(type: string, props: Props, ...children: Array<VNode | string>): VNode {
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
        .map(child => typeof child === 'object'? child : createTextElement(child as string))
        .filter(e => e != null)
    }
  } as VNode
}

export function Fragment(props: Props) {
  return props.children
}

export function lazy(fn: Function) {
  let comp, err, p
  return function Lazy(props) {
    if (!p) {
      p = fn()
        .then(resp => comp = resp)
        .catch(e => err = e)
    }
    if (err) {
      throw err
    }
    if (!comp) {
      throw p
    }
    return h(comp, props)
  }
}

export function Suspense(props) {
  return props.children
}