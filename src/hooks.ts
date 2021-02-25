import { StateHook } from './type'
import { getWipFiber, getWipRoot, getCurrentRoot, setNextUnitOfWork, setWipRoot, resetDeletions } from './reconciler'

let hookIndex = null

export const resetHookIndex = () => hookIndex = 0

export function useState(initialState: any) {

  let wipFiber = getWipFiber()
  let wipRoot = getWipRoot()

  const oldHook: StateHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex]
  const hook: StateHook = {
    state: oldHook ? oldHook.state : initialState,
    queue: []
  }

  const actions = oldHook ? oldHook.queue : []

  actions.forEach(action => {
    hook.state = action instanceof Function ? action(hook.state) : action
  })

  const setState = action => {
    let currentRoot = getCurrentRoot()
    hook.queue.push(action)
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot
    }
    setWipRoot(wipRoot)
    setNextUnitOfWork(wipRoot)
    resetDeletions()
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}
