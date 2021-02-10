import { Fiber, VNode } from './type'

import { resetHookIndex } from './hooks'
import { createDom, updateDom } from './dom'

let currentRoot: Fiber = null
let wipRoot: Fiber = null
let nextUnitOfWork: Fiber = null
let deletions: Fiber[] = null
let wipFiber: Fiber = null

export const getWipFiber = () => wipFiber
export const getWipRoot = () => wipRoot
export const getCurrentRoot = () => currentRoot
// export const getNextUnitOfWork = () => nextUnitOfWork
export const getDeletions = () => deletions

export const setNextUnitOfWork = (fiber: Fiber) => nextUnitOfWork = fiber

export const setWipRoot = (fiber: Fiber): void => {
  wipRoot = fiber
}

export function render(element: VNode, container: HTMLElement): void {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  }
  deletions = []
  nextUnitOfWork = wipRoot
}

function reconcileChildren(wipFiber: Fiber, children: VNode): void {
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (
    index < (children as VNode[]).length ||
    oldFiber != null
  ) {
    const child = children[index]

    let newFiber: Fiber = null
    const sameType = oldFiber && child && child.type === oldFiber.type

    if (sameType) {
      // update
      newFiber = {
        type: oldFiber.type,
        props: child.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }
    if (child && !sameType) {
      // add
      newFiber = {
        type: child.type,
        props: child.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT'
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else if (child) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

function updateFunctionComponent(fiber: Fiber): void {
  wipFiber = fiber
  resetHookIndex()
  wipFiber.hooks = []
  const children = [(fiber.type as Function)(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber: Fiber): void {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  const children = fiber.props.children
  reconcileChildren(fiber, children)
}

function performUnitOfWork(fiber: Fiber): Fiber {
  const isFunctionComponent = fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if(nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
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

  let parentFiber = fiber.parent
  while (!parentFiber.dom) {
    parentFiber = parentFiber.parent
  }

  const parentDom = parentFiber.dom
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
    parentDom.appendChild(fiber.dom)
  }
  if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, parentDom)
  }
  if (fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitRoot(): void {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function workLoop(deadline): void {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  window.requestIdleCallback(workLoop)
}

window.requestIdleCallback(workLoop)