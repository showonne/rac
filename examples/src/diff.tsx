import { h, render, useEffect, useState } from '../../src'
import { random, shuffle } from 'lodash'

const genSource = () => {
  const source = shuffle(Array(random(0, 10)).fill('').map((_, index) => index))
  console.log(source)
  return source
}

function App() {
  const [keys, setKeys] = useState([0, 1, 2, 3, 4, 5])
  // const [keys, setKeys] = useState([3, 4, 2, 1, 0])

  // useEffect(() => {
  //   setInterval(() => {
  //     setKeys(genSource())
  //   }, 100)
  // }, [])
 
  return (
    <div>
      <p>
        {keys.join(',')}
      </p>
      <ul>
        {
          keys.map(key => key === 1 ? <div style="color: red;" key={key}>key 1 div</div> : <li key={key}>{key}</li>)
        }
      </ul>
      <button onClick={() => setKeys(genSource())}>Change key</button>
      {/* <button onClick={() => setKeys([0, 3, 1, 2])}>Change key</button> */}
      <button onClick={() => setKeys(prev => prev.concat([prev.length + 1]))}>Add Item</button>
    </div>
  )
}

render(<App />, document.querySelector('#root'))
