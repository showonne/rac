import { Fiber, VNode, ElementNode } from './type'
import { resetHookIndex } from './hooks'
import { schedule, scheduleWork, shouldYield } from './scheduler'
import { createDom, updateDom } from './dom'

let currentRoot: Fiber = null
let WIPRoot: Fiber = null
let deletions: Fiber[] = []
let WIPFiber: Fiber = null

const arrayfy = child => Array.isArray(child) ? child : [child]

export const isFn = fn => fn instanceof Function
export const getWIPFiber = () => WIPFiber
export const getCurrentRoot = () => currentRoot

export const setWIPRoot = (fiber: Fiber) => WIPRoot = fiber
export const resetDeletions = () => deletions = []

export function render(element: VNode, container: HTMLElement): void {
  WIPRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot,
    isSVG: (element as ElementNode).type === 'svg'
  }
  disPatchUpdate(WIPRoot)
}

export function disPatchUpdate(nextUnitOfWork) {
  scheduleWork(workLoop.bind(null, nextUnitOfWork))
}

function reconcileChildren(WIPFiber: Fiber, children: VNode): void {
  let index = 0
  let oldFiber = WIPFiber.alternate && WIPFiber.alternate.child
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
        ref: oldFiber.ref,
        props: currentChild.props,
        dom: oldFiber.dom,
        parent: WIPFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
        hooks: oldFiber.hooks,
        isSVG: WIPFiber.isSVG || currentChild.type === 'svg'
      }
    }
    if (currentChild && !sameType) {
      newFiber = {
        type: currentChild.type,
        ref: currentChild.ref,
        props: currentChild.props,
        dom: null,
        parent: WIPFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
        isSVG: WIPFiber.isSVG || currentChild.type === 'svg'
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
      WIPFiber.child = newFiber
    } else if (currentChild) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

function updateFunctionComponent(fiber: Fiber): void {
  WIPFiber = fiber
  resetHookIndex()
  const children = arrayfy((fiber.type as Function)(fiber.props))
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
    if(fiber.sibling) {
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
    commitDeletion(fiber, parentDom)
    if (fiber.ref) {
      fiber.ref.current = null
    }
    return
  }

  if (fiber.effectTag === 'UPDATE') {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  }

  if (fiber.ref) {
    fiber.ref.current = fiber.dom
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitRoot(): void {
  deletions.forEach(commitWork)
  commitWork(WIPRoot.child)
  currentRoot = WIPRoot
  resetDeletions()
  WIPRoot = null
}

function workLoop(nextUnitOfWork): void {
  while (nextUnitOfWork && !shouldYield()) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  if (nextUnitOfWork) {
    return workLoop.bind(null, nextUnitOfWork)
  }

  if (!nextUnitOfWork && WIPRoot) {
    commitRoot()
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