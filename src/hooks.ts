import { isFn, getWIPFiber, getCurrentRoot, setNextUnitOfWork, setWIPRoot, resetDeletions } from './reconciler'

let hookIndex = null

export const resetHookIndex = () => hookIndex = 0

const updateRoot = () => {
  let currentRoot = getCurrentRoot()
  let WIPRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot
  }

  setWIPRoot(WIPRoot)
  setNextUnitOfWork(WIPRoot)
  resetDeletions()
}

export function useState(initialState: any) {
  return useReducer(null, initialState)
}

export function useReducer(reducer, initialState) {
  let WIPFiber = getWIPFiber()

  WIPFiber.hooks = WIPFiber?.hooks || []

  let hook

  if (hookIndex >= WIPFiber.hooks.length) {
    WIPFiber.hooks.push({value: initialState})
  }
  hook = WIPFiber.hooks[hookIndex]
  
  const dispatch = value => {
    if (reducer) {
      hook.value = reducer(hook.value, value)
    } else {
      hook.value = isFn(value) ? value(hook.value) : value
    }

    updateRoot()
  }

  WIPFiber.hooks[hookIndex++] = hook
  return [hook.value, dispatch]
}