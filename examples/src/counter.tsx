import { useState, h, render, Fragment, useReducer, useMemo, useCallback, useRef } from '../../src/index'

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}


function Counter() {
  const [title, setTitle] = useState('Hello')
  const [state, dispatch] = useReducer(reducer, initialState)
  const countRef = useRef(null)

  const desc = () => dispatch({ type: 'decrement' })
  const inc = () => dispatch({ type: 'increment' })

  const number = useMemo(() => {
    console.log('number 1 with no deps')
    return 1
  }, [])

  const logCount = useCallback(() => {
    console.log(`log count:`, state.count)
    console.log('ref', countRef.current)
  }, [state.count])

  logCount()

  const updateTitle = () => {
    setTitle(prev => `${prev}+`)
  }

  return (
    <>
      <p ref={countRef}>Count: {state.count}</p>
      <button onClick={desc}>-</button>
      <button onClick={inc}>+</button>
      <div>Divide</div>
      Title: {title}
      <button onClick={updateTitle}>update title</button>
      {state.count < 2 ? <div>small</div> : <div>large</div>}
    </>
  );
}

render(<Counter />, document.querySelector('#root'))