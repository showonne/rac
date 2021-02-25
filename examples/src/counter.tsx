import { useState, h, render, Fragment } from '../../src/index'

function Greet() {
  return <p>Hello ~</p>
}

function Counter() {
  const [state, setState] = useState(1)
  const [state2, setState2] = useState(2)

  const updateState2 = () => {
    setState2(state2 + 1)
  }

  return (
    <Fragment>
      <div>
        <h1 onClick={() => setState(c => c + 1)}>
          Count: {state}
        </h1>
        <h1 onClick={updateState2}>
          Count: {state2}
        </h1>
        <Greet />
        {
          state === 1 ? <div><span>a</span><span>b</span></div> : <div><div>c</div><div>d</div></div>
        }
      </div>
      <div>
        div 2
      </div>
    </Fragment>
  )
}
const element = <Counter />
const container = document.querySelector('#root')
render(element, container)