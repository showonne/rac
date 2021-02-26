import { updateDom } from '../../src/dom';
import { useState, h, render, Fragment, useReducer, useMemo, useCallback } from '../../src/index'

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
  const [state, dispatch] = useReducer(reducer, initialState);

  const desc = () => dispatch({ type: 'decrement' })
  const inc = () => dispatch({ type: 'increment' })

  const number = useMemo(() => {
    console.log('number 1 with no deps')
    return 1
  }, [])

  const logCount = useCallback(() => {
    console.log(`log count:`, state.count)
  }, [state.count])

  logCount()

  console.log(number)

  const updateTitle = () => {
    setTitle(prev => `${prev}+`)
  }

  return (
    <>
      Count: {state.count}
      <button onClick={desc}>-</button>
      <button onClick={inc}>+</button>
      <div></div>
      Title: {title}
      <button onClick={updateTitle}>update title</button>
    </>
  );
}

render(<Counter />, document.querySelector('#root'))