import { isFn, getWIPFiber, getCurrentRoot, setNextUnitOfWork, setWIPRoot, resetDeletions } from './reconciler'

let hookIndex = null

const hasChanged = (prevDeps, currentDeps) => !prevDeps || prevDeps.length !== currentDeps.length || prevDeps.some((val, index) => val !== currentDeps[index])

function getHook() {
  let WIPFiber = getWIPFiber()

  WIPFiber.hooks = WIPFiber?.hooks || []

  if (hookIndex >= WIPFiber.hooks.length) {
    WIPFiber.hooks.push({})
  }
  return WIPFiber.hooks[hookIndex++]
}

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
  let hook = getHook()
  
  const dispatch = value => {
    if (reducer) {
      hook.value = reducer(hook.value, value)
    } else {
      hook.value = isFn(value) ? value(hook.value) : value
    }

    updateRoot()
  }

  return [hook.value ? hook.value : hook.value = initialState, dispatch]
}

export function useMemo(cb, deps) {
  let hook = getHook()

  if (hasChanged(hook.deps, deps)) {
    hook.deps = deps
    return hook.value = cb()
  } else {
    return hook.value
  }
}

export function useCallback(cb, deps) {
  return useMemo(() => cb, deps)
}