import { Fragment, h, render, useState, useReducer, useCallback } from '../../src'
import "todomvc-app-css/index.css"
import './global.less'

const Aside = () => {
  return (
    <aside className="learn"><header> <h3>JavaScript</h3> <span className="source-links">   <h5>Vanilla JavaScript Example</h5> <a href="https://github.com/tastejs/todomvc/tree/gh-pages/examples/vanillajs">Source</a>   </span> </header> <hr /> <blockquote className="quote speech-bubble"> <p>JavaScript® (often shortened to JS) is a lightweight, interpreted, object-oriented language with first-class functions, most known as the scripting language for Web pages, but used in many non-browser environments as well such as node.js or Apache CouchDB.</p> <footer> <a href="http://developer.mozilla.org/en-US/docs/JavaScript">JavaScript</a> </footer> </blockquote>  <footer> <hr /> <em>If you have other helpful links to share, or find any of the links above no longer work, please <a href="https://github.com/tastejs/todomvc/issues">let us know</a>.</em> </footer></aside>
  )
}
const Info = () => {
  return (
    <footer className="info">
      <p>Double-click to edit a todo</p>
      <p>Created by <a href="http://twitter.com/oscargodson">Oscar Godson</a></p>
      <p>Refactored by <a href="https://github.com/cburgmer">Christoph Burgmer</a></p>
      <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
    </footer>
  )
}

let uid = 0

const reducer = (todos, action) => {
  const { type } = action
  if (type === 'add') {
    return todos.concat([{ uid: uid++, done: false, content: action.content }])
  }
  if (type === 'toggle') {
    return todos.map(todo => todo.uid === action.uid ? {...todo, done: !todo.done} : todo)
  }
  if (type === 'delete') {
    const index = todos.findIndex(todo => todo.uid === action.uid)
    return todos.slice(0, index).concat(todos.slice(index + 1))
  }
  if (type === 'clearCompleted') {
    return todos.filter(todo => !todo.done)
  }
  return todos
}

const TodoApp = () => {
  const [content, setContent] = useState('')
  const [todos, dispatch] = useReducer(reducer, [])

  const updateContent = e => setContent(e.target.value)

  const addTodo = e => {
    if (!e.target.value) return
    if (e.keyCode === 13) {
      dispatch({ type: 'add', content: e.target.value })
      // setContent('')
    }
  }

  const toggle = uid => dispatch({ type: 'toggle', uid })
  const destroy = uid => dispatch({ type: 'delete', uid })
  const clearCompleted = () => dispatch({ type: 'clearCompleted' })

  console.log(todos)
  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <input className="new-todo" value={content} onKeyDown={addTodo} onInput={updateContent} placeholder="What needs to be done?" autofocus="" />
      </header>
      <section className="main" style="display: block;">
        <input id="toggle-all" className="toggle-all" type="checkbox" />
        <label for="toggle-all">Mark all as complete</label>
        <ul className="todo-list">
          {
            todos.map(todo => (
              <li className={todo.done ? 'completed' : ''}>
                <div className="view">
                  <input className="toggle" checked={todo.done} type="checkbox" onClick={() => toggle(todo.uid)} />
                  <label>{todo.content}</label>
                  <button className="destroy" onClick={() => destroy(todo.uid)}></button>
                </div>
              </li>
            ))
          }
        </ul>
      </section>
      <footer className="footer" style="display: block;">
        <span className="todo-count"><strong>{todos.filter(todo => !todo.done).length}</strong> item left</span>
        <ul className="filters">
          <li>
            <a href="#/" className="selected">All</a>
          </li>
          <li>
            <a href="#/active">Active</a>
          </li>
          <li>
            <a href="#/completed">Completed</a>
          </li>
        </ul>
        {
          todos.filter(todo => todo.done).length ? <button className="clear-completed" style="display: block;" onClick={clearCompleted}>Clear completed</button> : null
        }
      </footer>
    </section>
  )
}

const App = () => {
  return (
    <Fragment>
      <Aside></Aside>
      <TodoApp></TodoApp>
      <Info></Info>
    </Fragment>
  )
}

render(<App></App>, document.querySelector('#root'))