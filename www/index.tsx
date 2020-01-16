//import React from 'react'
//import ReactDOM from 'react-dom'
//import App from './components/App'
import * as THREE from 'three'
import vert from './glsl/shader.vert'
import frag from './glsl/shader.frag'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const rust = import('../pkg')

rust
  .then(m => {
    const { World } = m

    //ReactDOM.render(<App />, document.getElementById('root'))

    const scale = 50
    const centreOffset = (scale - 1.0) / 2.0
    let p = 0
    let width = window.innerWidth
    let height = window.innerHeight
    let world = new World(scale)
    let buffer: Float32Array = world.get_buffer()

    let scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    let camera = new THREE.OrthographicCamera(
      width / -64,
      width / 64,
      height / 64,
      height / -64,
      -10000,
      10000
    )
    camera.position.set(Math.random() * 5, Math.random() * 5, Math.random() * 5)

    let renderer = new THREE.WebGLRenderer({ alpha: true })
    renderer.setSize(width, height)

    let controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.25
    controls.enableZoom = true

    document.body.appendChild(renderer.domElement)

    let vertices = []
    let indices = []
    let index = 0

    for (let i = 0; i < scale; i++) {
      for (let j = 0; j < scale; j++) {
        for (let k = 0; k < scale; k++) {
          indices.push(index)
          index++
          vertices.push(
            ...[i - centreOffset, j - centreOffset, k - centreOffset]
          )
        }
      }
    }

    const vertexBuffer = new Float32Array(vertices)
    const indexBuffer = new Float32Array(indices)

    let geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(vertexBuffer, 3)
    )
    geometry.setAttribute('index', new THREE.BufferAttribute(indexBuffer, 1))
    geometry.setAttribute('color', new THREE.BufferAttribute(buffer, 4))

    let shader = new THREE.ShaderMaterial({
      uniforms: {
        p: { type: 'f', value: 0 },
        resolution: {
          type: 'v2',
          value: new THREE.Vector2(
            renderer.domElement.width,
            renderer.domElement.height
          )
        }
      },
      vertexShader: vert,
      fragmentShader: frag
    })

    let grid = new THREE.Points(geometry, shader)

    scene.add(grid)

    /*
    const renderTargetParams = {
      stencilBuffer: false,
      depthBuffer: false
    }

    let buffer01 = new THREE.WebGLRenderTarget(
      width,
      height,
      renderTargetParams
    )

    let buffer02 = new THREE.WebGLRenderTarget(
      width,
      height,
      renderTargetParams
    )

    let buffer03 = new THREE.WebGLRenderTarget(
      width,
      height,
      renderTargetParams
    )

    let bufferScene = new THREE.Scene()

    let bufferMaterial = new THREE.ShaderMaterial({
      uniforms: {
        current: { type: 't', value: buffer01.texture },
        delay: { type: 't', value: buffer02.texture },
        resolution: {
          type: 'v2',
          value: new THREE.Vector2(width, height)
        }
      },
      fragmentShader: bufferFrag
    })

    let plane = new THREE.PlaneBufferGeometry(width, height)
    let bufferObject = new THREE.Mesh(plane, bufferMaterial)
    bufferScene.add(bufferObject)

    let bufferCamera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      -10000,
      10000
    )

    bufferCamera.position.z = 2
    */

    let renderScene = new RenderPass(scene, camera)

    let bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.0,
      0.0,
      0.0
    )

    let composer = new EffectComposer(renderer)
    composer.addPass(renderScene)
    composer.addPass(bloomPass)

    let animate = function() {
      //setTimeout(() => {
      requestAnimationFrame(animate)
      //}, 1000 / 30)
      p += 0.1
      shader.uniforms.p.value = p
      world.update()
      geometry.attributes.color.needsUpdate = true
      /*
      renderer.setRenderTarget(buffer01)
      renderer.render(scene, camera)
      bufferMaterial.uniforms.current.value = buffer01.texture
      bufferMaterial.uniforms.delay.value = buffer02.texture
      renderer.setRenderTarget(buffer03)
      renderer.render(bufferScene, bufferCamera)
      */
      composer.render()
      /*
      let temp = buffer03
      buffer03 = buffer02
      buffer02 = temp
      */
    }

    animate()
  })
  .catch(console.error)
