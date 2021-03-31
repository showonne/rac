import { h, render, lazy, Suspense } from '../../src/index'

const step = 1

const Content = lazy(() => {
  return new Promise((resolve, reject) =>
    setTimeout(
      () => resolve(props => <div>Hello {props.name}</div>)
      // () => reject(new Error('unknow error'))
      , 1000 * step
    )
  )
})

const Content2 = lazy(() => {
  return new Promise((resolve, reject) =>
    setTimeout(
      () => resolve(props => <div>Hello {props.name}</div>)
      // () => reject(new Error('unknow error'))
      , 2000 * step
    )
  )
})

const Content3 = lazy(() => {
  return new Promise((resolve, reject) =>
    setTimeout(
      () => resolve(props => <div>Hello {props.name}</div>)
      // () => reject(new Error('unknow error'))
      , 3000 * step
    )
  )
})

function App() {
  return [
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Content name="kitty" />
      </Suspense>
    </div>,
    <p>
      <Suspense fallback={<h1>Loading2...</h1>}>
        <Content2 name="a" />
        <Content3 name="b" />
      </Suspense>
    </p>
  ]
}

render(<App />, document.querySelector('#root'))