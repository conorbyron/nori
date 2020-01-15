import React from 'react'
import DotGrid from './DotGrid'
import Cursor from './Cursor'

const App = () => (
  <div>
    <h1>nori</h1>
    <div className="blue-rounded white-border">
      <DotGrid />
    </div>
    <Cursor />
  </div>
)

export default App
