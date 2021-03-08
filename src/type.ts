export type StateHook = {
  state: any,
  queue: any[]
}

export interface Props extends Record<string, any> {
  children: VNode
}

export type TextNode = string | number

export interface ElementNode<P extends Props = any> {
  type: string,
  props: P
}

export type VNode = TextNode | ElementNode | VNode[] | null | undefined

export type Fiber<P extends Props = any> = {
  type?: string | Function,
  dirty?: Boolean,
  ref?: any,
  kids?: any[],
  props: P,
  dom?: null | HTMLElement,
  parent?: Fiber,
  sibling?: Fiber,
  prevProps: P,
  effectTag?: string,
  child?: Fiber,
  hooks?: any,
  isSVG?: any
}