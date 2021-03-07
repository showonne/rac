import { isFn, getWIPFiber, disPatchUpdate } from './reconciler'

let hookIndex = null

const hasChanged = (prevDeps, currentDeps) => !prevDeps || prevDeps.length !== currentDeps.length || prevDeps.some((val, index) => val !== currentDeps[index])

function getHook() {
  let WIPFiber = getWIPFiber()

  WIPFiber.hooks = WIPFiber?.hooks || { list: [], effect: [], layout: [] }

  if (hookIndex >= WIPFiber.hooks.list.length) {
    WIPFiber.hooks.list.push({})
  }
  return [WIPFiber.hooks.list[hookIndex++], WIPFiber]
}

export const resetHookIndex = () => hookIndex = 0

export function useState(initialState: any) {
  return useReducer(null, initialState)
}

export function useReducer(reducer, initialState) {
  let [hook, WIPFiber] = getHook()
  
  const dispatch = value => {
    if (reducer) {
      hook.value = reducer(hook.value, value)
    } else {
      hook.value = isFn(value) ? value(hook.value) : value
    }
    disPatchUpdate(WIPFiber)
  }

  return [hook.value != null ? hook.value : hook.value = initialState, dispatch]
}

export function useMemo(cb, deps) {
  let [hook] = getHook()

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

export function useRef(current) {
  return useMemo(() => ({current}), [])
}

export function useEffect(cb, deps) {
  const [hook, WIPFiber] = getHook()

  if (hasChanged(hook.deps, deps)) {
    hook.deps = deps
    hook.cb = cb
    WIPFiber.hooks.effect.push(hook)
  }
}

export function useLayoutEffect(cb, deps) {
  const [hook, WIPFiber] = getHook()

  if (hasChanged(hook.deps, deps)) {
    hook.deps = deps
    hook.cb = cb
    WIPFiber.hooks.layout.push(hook)
  }
}