import { Fragment, h, render, useState, useReducer, useEffect } from '../../src'
import "todomvc-app-css/index.css"
import './global.less'

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
    return todos.map(todo => todo.uid === action.uid ? { ...todo, done: !todo.done } : todo)
  }
  if (type === 'delete') {
    const index = todos.findIndex(todo => todo.uid === action.uid)
    return todos.slice(0, index).concat(todos.slice(index + 1))
  }
  if (type === 'startEdit') {
    return todos.map(todo => todo.uid === action.uid ? { ...todo, editing: true, editContent: todo.content } : todo)
  }
  if (type === 'onEdit') {
    return todos.map(todo => todo.uid === action.uid ? { ...todo, editContent: action.editContent } : todo)
  }
  if (type === 'clearCompleted') {
    return todos.filter(todo => !todo.done)
  }
  if (type === 'submit') {
    return todos.map(todo => todo.uid === action.uid ? { ...todo, content: todo.editContent, editContent: '', editing: false } : todo)
  }

  return todos
}

const tabs = [
  { label: 'All', id: -1 },
  { label: 'Active', id: 1 },
  { label: 'Completed', id: 0 }
]

const TodoApp = () => {
  const [content, setContent] = useState('')
  const [todos, dispatch] = useReducer(reducer, [])
  const [todos4Show, setTodos4Show] = useState([])
  const [currentTab, setCurrentTab] = useState(-1)

  const updateContent = e => setContent(e.target.value)

  const addTodo = e => {
    if (!e.target.value) return
    if (e.keyCode === 13) {
      dispatch({ type: 'add', content: e.target.value })
      setContent('')
    }
  }

  const handleEdit = ({ uid, content }) => {
    dispatch({ type: 'startEdit', uid })
  }

  const handleKeydown = (e, todo) => {
    if (e.keyCode === 13) {
      handleSubmit(todo)
    }
  }

  const handleInput = (e, uid) => {
    dispatch({ type: 'onEdit', uid, editContent: e.target.value })
  }

  const toggle = uid => dispatch({ type: 'toggle', uid })
  const destroy = uid => dispatch({ type: 'delete', uid })
  const clearCompleted = () => dispatch({ type: 'clearCompleted' })

  // edit
  const handleSubmit = (todo) => {
    if (!todo.editing) return
    dispatch({ type: 'submit', uid: todo.uid })
  }

  useEffect(() => {
    let tmp
    switch (currentTab) {
      case 0:
        tmp = todos.filter(todo => todo.done)
        break
      case 1:
        tmp = todos.filter(todo => !todo.done)
        break
      case -1:
      default:
        tmp = todos
    }
    setTodos4Show(tmp)
  }, [todos, currentTab])

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <input className="new-todo" value={content} onKeyDown={addTodo} onInput={updateContent} placeholder="What needs to be done?" />
      </header>
      <section className="main" style="display: block;">
        <input id="toggle-all" className="toggle-all" type="checkbox" />
        <label for="toggle-all">Mark all as complete</label>
        <ul className="todo-list">
          {
            todos4Show.map(todo => (
              <li className={`${todo.done ? 'completed' : ''} ${todo.editing ? 'editing' : ''}`}>
                <div className="view">
                  <input className="toggle" checked={todo.done} type="checkbox" onClick={() => toggle(todo.uid)} />
                  <label onDblClick={() => { handleEdit(todo) }}>{todo.content}</label>
                  <button className="destroy" onClick={() => destroy(todo.uid)}></button>
                </div>
                <input
                  className="edit"
                  value={todo.editContent}
                  onBlur={ () => handleSubmit(todo) }
                  onInput={ (e) => handleInput(e, todo.uid) }
                  onKeyDown={ (e) => handleKeydown(e, todo) }
                />
              </li>
            ))
          }
        </ul>
      </section>
      <footer className="footer" style="display: block;">
        <span className="todo-count"><strong>{todos4Show.filter(todo => !todo.done).length}</strong> item left</span>
        <ul className="filters">
          {
            tabs.map(tab => (
              <li key={tab.id} onClick={() => setCurrentTab(tab.id)}>
                <a className={tab.id === currentTab ? 'selected' : ''}>{tab.label}</a>
              </li>
            ))
          }
        </ul>
        {
          todos4Show.filter(todo => todo.done).length ? <button className="clear-completed" style={{display: 'block'}} onClick={clearCompleted}>Clear completed</button> : null
        }
      </footer>
    </section>
  )
}

const App = () => {
  return (
    <Fragment>
      <TodoApp></TodoApp>
      <Info></Info>
    </Fragment>
  )
}

render(<App></App>, document.querySelector('#root'))