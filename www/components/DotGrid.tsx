import React, { useState } from 'react'

const Dot = () => {
  const [pressed, togglePressed] = useState(false)
  return (
    <div
      className={`dot white-border${pressed ? ' pressed' : ''}`}
      onClick={() => togglePressed(!pressed)}
    ></div>
  )
}

const DotGrid = () => {
  return (
    <div className="board">
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
      <Dot />
    </div>
  )
}

export default DotGrid
