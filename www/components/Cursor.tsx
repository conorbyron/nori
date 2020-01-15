import React, { useEffect } from 'react'

const Cursor = () => {
  useEffect(() => {
    const cursor = document.getElementById('cursor')

    window.onmousemove = (e: MouseEvent) => {
      if (cursor) {
        cursor.style.top = e.pageY - 50 + 'px'
        cursor.style.left = e.pageX - 50 + 'px'
      }
    }
  })

  return (
    <div id="cursor">
      <div id="hori"></div>
      <div id="vert"></div>
    </div>
  )
}

export default Cursor
