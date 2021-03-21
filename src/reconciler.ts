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
  if (!fiber.dirty) {
    fiber.dirty = true
    fiber.sibling = null
    scheduleWork(workLoop.bind(null, fiber))
  }
}

const isSame = (node1, node2) => node1.key === node2.key

function clone(target, source) {
  target.dom = source.dom
  target.ref = source.ref
  target.prevProps = source.props
  target.hooks = source.hooks
  target.kids = source.kids
  target.isSVG = source.isSVG
}

function reconcileChildren(WIPFiber: Fiber, children: VNode): void {
  const oldChildren = WIPFiber.kids || []
  const newChildren = (WIPFiber.kids = arrayfy(children))

  let oldStart = 0
  let oldEnd = oldChildren.length - 1
  let newStart = 0
  let newEnd = newChildren.length - 1

  let oldStartNode = oldChildren[oldStart]
  let oldEndNode = oldChildren[oldEnd]
  let newStartNode = newChildren[newStart]
  let newEndNode = newChildren[newEnd]

  while (oldStart <= oldEnd && newStart <= newEnd) {
    if (!oldStartNode) {
      oldStartNode = oldChildren[++oldStart]
    } else if (!oldEndNode) {
      oldEndNode = oldChildren[--oldEnd]
    } else if (isSame(oldStartNode, newStartNode)) {
      clone(newStartNode, oldStartNode)
      newStartNode.effectTag = 'UPDATE'

      oldStartNode = oldChildren[++oldStart]
      newStartNode = newChildren[++newStart]
    } else if (isSame(oldEndNode, newEndNode)) {
      clone(newEndNode, oldEndNode)
      newEndNode.effectTag = 'UPDATE'

      oldEndNode = oldChildren[--oldEnd]
      newEndNode = newChildren[--newEnd]
    } else if (isSame(oldStartNode, newEndNode)) {
      clone(newEndNode, oldStartNode)
      newEndNode.effectTag = 'INSERT'
      newEndNode.after = oldChildren[oldEndNode + 1]
      // WIPFiber.dom.insertBefore(oldStartNode.dom, oldEndNode.dom.nextSibling)

      oldStartNode = oldChildren[++oldStart]
      newEndNode = newChildren[--newEnd]
    } else if (isSame(oldEndNode, newStartNode)) {
      clone(newStartNode, oldEndNode)
      newStartNode.effectTag = 'INSERT'
      newStartNode.after = oldStartNode
      // WIPFiber.dom.insertBefore(oldEndNode.dom, oldStartNode.dom)

      oldEndNode = oldChildren[--oldEnd]
      newStartNode = newChildren[++newStart]
    } else {
      const indexInOld = oldChildren.findIndex(child => isSame(child, newStartNode))
      if (indexInOld >= 0) {
        const oldNode = oldChildren[indexInOld]
        clone(newStartNode, oldNode)
        newStartNode.effectTag = 'INSERT'
        newStartNode.after = oldStartNode
        // WIPFiber.dom.insertBefore(newStartNode.dom, oldStartNode.dom)
        oldChildren[indexInOld] = undefined
      } else {
        newStartNode.effectTag = 'INSERT'
        // newStartNode.dom = createDom(newStartNode)
        newStartNode.after = oldStartNode
        // WIPFiber.dom.insertBefore(newStartNode.dom, oldStartNode.dom)
      }
      newStartNode = newChildren[++newStart]
    }
  }
  if (oldEnd < oldStart) {
    for (let i = newStart; i <= newEnd; i++) {
      let node = newChildren[i]
      node.effectTag = 'INSERT'
      node.after = oldStartNode
      // newStartNode.dom = createDom(newStartNode)
      // WIPFiber.dom.insertBefore(newStartNode.dom, oldStartNode.dom)
    }
  } else if (newEnd < newStart) {
    for (let i = oldStart; i <= oldEnd; i++) {
      let node = oldChildren[i]
      node.effectTag = 'DELETION'
      deletions.push(node)
    }
  }

  let index = 0
  let prevSibling = null

  while (index < newChildren.length) {
    let currentChild = newChildren[index]
    if (index === 0) {
      WIPFiber.child = currentChild
    } else if (currentChild) {
      prevSibling.sibling = currentChild
    }

    currentChild.isSVG = WIPFiber.isSVG || currentChild.type === 'svg'
    currentChild.parent = WIPFiber

    prevSibling = currentChild
    index++
  }
}

function updateFunctionComponent<P = Props>(fiber: Fiber): void {
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
  while (!parentFiber.dom) {
    parentFiber = parentFiber.parent
  }
  const parentDom = parentFiber.dom

  if (fiber.effectTag === 'INSERT') {
    parentDom.insertBefore(fiber.dom, fiber.after?.dom)
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