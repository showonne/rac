import { useState, h, render } from '../../src/index'

function Counter() {
  const [state, setState] = useState(1)
  const [state2, setState2] = useState(2)

  const updateState2 = () => {
    setState2(state2 + 1)
  }

  return (
    <div>
      <h1 onClick={() => setState(c => c + 1)}>
        Count: {state}
      </h1>
      <h1 onClick={updateState2}>
        Count: {state2}
      </h1>
    </div>
  )
}
const element = <Counter />
const container = document.querySelector('#root')
render(element, container)