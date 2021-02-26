declare global {
  interface Window {
    requestIdleCallback: ((
      callback: ((deadline: RequestIdleCallbackDeadline) => void),
      opts?: RequestIdleCallbackOptions,
    ) => RequestIdleCallbackHandle);
    cancelIdleCallback: ((handle: RequestIdleCallbackHandle) => void);
  }
}

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
  ref?: any,
  props: P,
  dom?: null | HTMLElement,
  parent?: Fiber,
  sibling?: Fiber,
  alternate: null | Fiber,
  effectTag?: string,
  child?: Fiber,
  hooks?: any
}

type RequestIdleCallbackHandle = any
type RequestIdleCallbackOptions = {
  timeout: number
};
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean
  timeRemaining: (() => number)
}