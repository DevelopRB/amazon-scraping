import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Suppress findDOMNode warnings from ReactQuill (known issue with react-quill v2.0.0)
// This is a harmless warning from the library's internal code
const originalWarn = console.warn
const originalError = console.error

const shouldSuppress = (args) => {
  const message = typeof args[0] === 'string' ? args[0] : String(args[0])
  return message.includes('findDOMNode is deprecated') || 
         message.includes('Warning: findDOMNode')
}

console.warn = (...args) => {
  if (shouldSuppress(args)) return
  originalWarn.apply(console, args)
}

console.error = (...args) => {
  if (shouldSuppress(args)) return
  originalError.apply(console, args)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


