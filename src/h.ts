
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
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
    }
  }
}

export function Fragment(props) {
  return props.children
}