import { h, render, useState } from '../../src'

function App() {
  const [count, setCount] = useState(0)
  const up = () => {
    for (let i = 0; i < 10; i++) {
      console.log(i)
      setCount(i)
    }
  }
  return (
    <div>
      {count}
      <button onClick={up}>+</button>
    </div>
  )
}

render(<App />, document.querySelector('#root'))
