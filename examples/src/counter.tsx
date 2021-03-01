import { useState, h, render, Fragment, useReducer, useMemo, useCallback, useRef, useEffect, useLayoutEffect } from '../../src/index'

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

const Display = props => <div>{props.content}</div>

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

  useEffect(() => {
    document.title = state.count
    console.log('effect', state.count)
    return () => console.log('cleanup', state.count)
  }, [state.count])

  useLayoutEffect(() => {
    if (!document.getElementById('p')) {
      return
    }
    console.log('layout effect')
    const getRandom = () => Math.random() * 1000 % 255
    document.getElementById('p').style.cssText += `color: rgb(${getRandom()}, ${getRandom()}, ${getRandom()})`
  }, [state.count])

  let arr = Array(10).fill('').map((_, index) => index)

  return (
    <>
      <Display content={'Demo'}></Display>
      <p id="p" ref={countRef}>Count: {state.count}</p>
      <button onClick={desc}>-</button>
      <button onClick={inc}>+</button>
      <div>Divide</div>
      Title: {title}
      <button onClick={updateTitle}>update title</button>
      <svg>
        <circle
          cx="100"
          cy="50"
          r={Math.max(state.count * 10 + 10, 10)}
          stroke="black"
          stroke-width="2"
          fill="black"
        />
      </svg>
      <ul>
        {
          arr.map(item => {
            return <li>{item}</li>
          })
        }
      </ul>
    </>
  );
}

render(<Counter />, document.querySelector('#root'))