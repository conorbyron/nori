//import React from 'react'
//import ReactDOM from 'react-dom'
//import App from './components/App'
import * as THREE from 'three'
import vert from './glsl/shader.vert'
import frag from './glsl/shader.frag'
//import bufferFrag from './glsl/bufferShader.frag'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  scaleGenerator,
  pickNFromMGenerator
} from './utilities/numberGenerators'
import Tone from 'tone'
//import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
//import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
//import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const rust = import('../pkg')

rust
  .then(m => {
    const { World } = m

    //ReactDOM.render(<App />, document.getElementById('root'))

    const scale = 100
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
    controls.enablePan = false

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

    let renderScene = new RenderPass(bufferScene, bufferCamera)

    let bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.0,
      0.0,
      0.0
    )

    let composer = new EffectComposer(renderer)
    composer.addPass(renderScene)
    composer.addPass(bloomPass)
    */

    const noteScale = scaleGenerator([3, 2, 2, 3, 2])

    const pickNFrom16 = pickNFromMGenerator(16)

    let gain = new Tone.Gain(0).toMaster()
    let filter = new Tone.Filter(7000, 'peaking').connect(gain)
    filter.Q.value = 0.1
    filter.gain.value = 1
    let osc1 = new Tone.Oscillator(440, 'square').connect(filter)
    let osc2 = new Tone.Oscillator(440, 'square').connect(filter)
    let osc3 = new Tone.Oscillator(440, 'square').connect(filter)
    let osc4 = new Tone.Oscillator(440, 'square').connect(filter)

    const keyDown = () => {
      Tone.context.resume().then(() => {
        Tone.Transport.start()
        gain.gain.exponentialRampTo(0.01, 10)
        osc1.start()
        osc2.start()
        osc3.start()
        osc4.start()
      })
    }

    window.addEventListener('keydown', keyDown)
    window.addEventListener('touchend', keyDown)
    window.addEventListener('click', keyDown)

    const loopTime = 4
    const rampTime = 1.5

    let loop = new Tone.Loop(time => {
      const numbers = pickNFrom16(4).sort((a, b) => a - b)
      console.log(numbers)
      const notes = numbers.map(el => Tone.Frequency.mtof(noteScale(el) + 40))
      osc1.frequency.linearRampTo(notes[0], rampTime)
      osc2.frequency.linearRampTo(notes[1], rampTime)
      osc3.frequency.linearRampTo(notes[2], rampTime)
      osc4.frequency.linearRampTo(notes[3], rampTime)
    }, loopTime).start(0)

    let cameraPosition = new THREE.Vector3(0, 0, 0)

    const filterRampTime = 0.05

    let cameraPositionLoop = new Tone.Loop(time => {
      cameraPosition.copy(camera.position)
      cameraPosition.normalize()
      filter.frequency.linearRampTo(
        Math.pow(2, 10 + 4 * cameraPosition.x),
        filterRampTime
      )
      filter.Q.linearRampTo(
        Math.pow(2, 1 + 3 * cameraPosition.y),
        filterRampTime
      )
      filter.gain.linearRampTo(25 + 10 * cameraPosition.z, filterRampTime)
    }, filterRampTime).start(0)

    let animate = function() {
      //setTimeout(() => {
      requestAnimationFrame(animate)
      //}, 1000 / 12)
      p += 0.1
      shader.uniforms.p.value = p
      world.update()
      geometry.attributes.color.needsUpdate = true
      //renderer.setRenderTarget(buffer01)
      renderer.render(scene, camera)
      /*
      bufferMaterial.uniforms.current.value = buffer01.texture
      bufferMaterial.uniforms.delay.value = buffer02.texture
      renderer.setRenderTarget(buffer03)
      renderer.render(scene, camera)
      composer.render()
      let temp = buffer03
      buffer03 = buffer02
      buffer02 = temp
      */
    }

    animate()
  })
  .catch(console.error)
