import { h, render, useState } from '../../src'

function App() {
  const [keys, setKeys] = useState([1, 2, 3, 4])
 
  return (
    <div>
      <ul>
        {
          keys.map(key => key === 1 ? <div key={key}>key 1 div</div> : <li key={key}>{key}</li>)
        }
      </ul>
      <button onClick={() => setKeys([2, 3, 4, 1])}>Change key</button>
      <button onClick={() => setKeys(prev => prev.concat([prev.length + 1]))}>Add Item</button>
    </div>
  )
}

render(<App />, document.querySelector('#root'))
