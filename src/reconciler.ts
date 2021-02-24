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

export const setNextUnitOfWork = (fiber: Fiber) => nextUnitOfWork = fiber
export const setWipRoot = (fiber: Fiber) => wipRoot = fiber
export const resetDeletions = () => deletions = []

export function render(element: VNode, container: HTMLElement): void {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  }
  resetDeletions()
  nextUnitOfWork = wipRoot

  window.requestIdleCallback(workLoop)
}

function reconcileChildren(wipFiber: Fiber, children: VNode): void {
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (
    index < (children as VNode[]).length ||
    oldFiber != null
  ) {
    const currentChild = children[index]

    let newFiber: Fiber = null
    const sameType = oldFiber && currentChild && currentChild.type === oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: currentChild.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }
    if (currentChild && !sameType) {
      newFiber = {
        type: currentChild.type,
        props: currentChild.props,
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
    } else if (currentChild) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

function updateFunctionComponent(fiber: Fiber): void {
  wipFiber = fiber
  resetHookIndex()
  fiber.hooks = []
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
    return
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