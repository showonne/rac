import { h, render } from '../../src'


const App = () => {
    const len = 1000

    return (
        <ul>
            {Array(len).fill(0).map((_, i) => <li key={i} >{i}</li>)}
        </ul>
    )
}

render(<App />, document.querySelector('#root'))
