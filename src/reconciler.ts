import { Fiber, VNode, ElementNode, FC, Props } from './type'
import { resetHookIndex } from './hooks'
import { schedule, scheduleWork, shouldYield } from './scheduler'
import { createDom, updateDom } from './dom'

let preCommit: Fiber = null
let deletions: Fiber[] = []
let WIPFiber: Fiber = null

const arrayfy = child => Array.isArray(child) ? child : [child]

export const isFn = (fn: any): boolean => fn instanceof Function
export const getWIPFiber = (): Fiber => WIPFiber

export const resetDeletions = (): any[] => deletions = []

export function render(element: VNode, container: HTMLElement): void {
  const rootFiber: Fiber = {
    dom: container,
    props: {
      children: [element]
    },
    isSVG: (element as ElementNode).type === 'svg'
  }
  disPatchUpdate(rootFiber)
}

export function disPatchUpdate(fiber: Fiber): void {
  if(!fiber.dirty) {
    fiber.dirty = true
    fiber.sibling = null
    scheduleWork(workLoop.bind(null, fiber))
  }
}

function reconcileChildren(WIPFiber: Fiber, children: VNode): void {
  let index = 0
  let prevSibling = null

  const oldChildren = WIPFiber.kids || []
  const newChildren = (WIPFiber.kids = arrayfy(children))

  const length = Math.max(oldChildren.length, newChildren.length)

  while (index < length) {

    const oldChild = oldChildren[index]
    const currentChild = newChildren[index]

    const sameType = oldChild && currentChild && oldChild.type === currentChild.type

    if (sameType) {
      currentChild.effectTag = 'UPDATE'
      currentChild.dom = oldChild.dom
      currentChild.ref = oldChild.ref
      currentChild.prevProps = oldChild.props
      currentChild.hooks = oldChild.hooks
      currentChild.kids = oldChild.kids
      currentChild.parent = WIPFiber
      currentChild.isSVG = WIPFiber.isSVG || currentChild.type === 'svg'
    }

    if (currentChild && !sameType) {
      currentChild.effectTag = 'PLACEMENT'
      currentChild.parent = WIPFiber
      currentChild.isSVG = WIPFiber.isSVG || currentChild.type === 'svg'
    }
    
    if (oldChild && !sameType) {
      oldChild.effectTag = 'DELETION'
      deletions.push(oldChild)
    }

    if (index === 0) {
      WIPFiber.child = currentChild
    } else if (currentChild) {
      prevSibling.sibling = currentChild
    }

    prevSibling = currentChild
    index++
  }
}

function updateFunctionComponent <P = Props>(fiber: Fiber): void {
  WIPFiber = fiber
  resetHookIndex()
  const children = arrayfy((fiber.type as FC<P>)(fiber.props))
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber: Fiber): void {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  reconcileChildren(fiber, fiber.props.children)
}

function performUnitOfWork(fiber: Fiber): Fiber {
  if (isFn(fiber.type)) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  if (fiber.child) {
    return fiber.child
  }
  while (fiber) {
    if (!preCommit && fiber.dirty) {
      preCommit = fiber
      fiber.dirty = false
      return null
    }

    if (fiber.sibling) {
      return fiber.sibling
    }
    fiber = fiber.parent
  }
}

function commitDeletion(fiber: Fiber, parent: HTMLElement): void {
  if (fiber.dom) {
    parent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, parent)
  }
}

function commitWork(fiber: Fiber): void {
  if (!fiber) {
    return
  }

  if (isFn(fiber.type)) {

    if (fiber.hooks) {
      executeEffect(fiber.hooks.layout)
      schedule(() => executeEffect(fiber.hooks.effect))
    }

    commitWork(fiber.child)
    commitWork(fiber.sibling)
    return
  }

  let parentFiber = fiber.parent
  while(!parentFiber.dom) {
    parentFiber = parentFiber.parent
  }
  const parentDom = parentFiber.dom

  if (fiber.effectTag === 'PLACEMENT') {
    parentDom.appendChild(fiber.dom)
  }

  if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, parentDom as HTMLElement)
    if (fiber.ref) {
      fiber.ref.current = null
    }
    return
  }

  if (fiber.effectTag === 'UPDATE') {
    updateDom(
      fiber.dom,
      fiber.prevProps,
      fiber.props
    )
  }

  if (fiber.ref) {
    fiber.ref.current = fiber.dom
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitRoot(fiber: Fiber): void {
  deletions.forEach(commitWork)
  fiber.parent ? commitWork(fiber) : commitWork(fiber.child)
  resetDeletions()
  preCommit = null
}

function workLoop(nextUnitOfWork: Fiber): void {
  while (nextUnitOfWork && !shouldYield()) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  
  if (nextUnitOfWork) {
    return workLoop.bind(null, nextUnitOfWork)
  }

  if (preCommit) {
    commitRoot(preCommit)
  }
}

function executeEffect(effects) {
  effects.forEach(cleanup)
  effects.forEach(effect)
  effects.length = 0
}

function cleanup(effect) {
  effect.cleanup && effect.cleanup()
}

function effect(effect) {
  effect.cleanup = effect.cb()
}