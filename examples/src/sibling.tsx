import { h, render } from '../../src'

const Child = props => (<div>Child {props.content || ''}</div>)

const App = () => {
  // The sibling field accounts for the case where render returns multiple children (a new feature in Fiber!):
  return [<Child content={1} />, <Child content={2} />]
}

render(<App />, document.querySelector('#root'))
