//import React from 'react'
//import ReactDOM from 'react-dom'
import * as THREE from 'three'
import vert from './glsl/shader.vert'
import frag from './glsl/shader.frag'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  scaleGenerator,
  pickNFromMGenerator
} from './utilities/numberGenerators'
import Tone from 'tone'

const rust = import('../pkg')

rust
  .then(m => {
    const { World } = m

    const scale = 50
    const centreOffset = (scale - 1.0) / 2.0
    let p = 0
    let width = window.innerWidth
    let height = window.innerHeight

    const noteScale = scaleGenerator([3, 2, 2, 3, 2])

    const min = Tone.Frequency.mtof(noteScale(0) + 40)
    const max = Tone.Frequency.mtof(noteScale(15) + 40)
    let world = new World(scale, min, max)
    let buffer: Float32Array = world.get_buffer()

    let scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    let camera = new THREE.OrthographicCamera(
      width / -16,
      width / 16,
      height / 16,
      height / -16,
      -10000,
      10000
    )
    camera.position.set(Math.random() * 5, Math.random() * 5, Math.random() * 5)

    let renderer = new THREE.WebGLRenderer({ alpha: true })
    renderer.setSize(width, height)

    let controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false

    document.body.appendChild(renderer.domElement)

    let boxGeometry = new THREE.BoxGeometry(50, 50, 50)
    let edges = new THREE.EdgesGeometry(boxGeometry)
    let cube = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    )
    scene.add(cube)

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

    const pickNFrom16 = pickNFromMGenerator(16)

    class CompleteVoice {
      ramp: Tone.BufferSource
      filter: Tone.Filter
      osc: Tone.Oscillator
      meter: Tone.Meter

      constructor(buffer: Tone.Buffer) {
        this.ramp = new Tone.BufferSource(buffer, () => {})
        this.ramp.loop = true
        this.ramp.playbackRate.value = 0.25
        this.filter = new Tone.Filter()
        this.filter.Q.value = 15
        this.ramp.connect(this.filter.frequency)
        this.osc = new Tone.Oscillator(440, 'square').connect(this.filter)
        this.meter = new Tone.Meter(0.0)
        this.ramp.connect(this.meter)
      }

      start() {
        this.osc.start()
        if (this.ramp.state != 'started') this.ramp.start()
      }

      rampTo(value: number, time: number) {
        this.osc.frequency.linearRampTo(value, time)
      }

      connect(node: Tone.ProcessingNode) {
        this.filter.connect(node)
      }

      getMeter(): number {
        return this.meter.getValue()
      }

      getFrequency(): number {
        return this.osc.frequency.value
      }
    }

    let gain = new Tone.Gain(0).toMaster()

    let rampVals = new Float32Array(44100)
    for (let i = 0; i < 44100; i++) {
      let pos = i / 44100
      if (pos < 0.7) rampVals[i] = pos / 0.7
      else rampVals[i] = 1 - (pos - 0.7) / 0.3
      rampVals[i] *= 1250
    }
    let rampBuffer = Tone.Buffer.fromArray(rampVals)
    let voices: CompleteVoice[] = []
    for (let i = 0; i < 4; i++) {
      let voice = new CompleteVoice(rampBuffer)
      voice.connect(gain)
      voices.push(voice)
    }

    const keyDown = () => {
      Tone.context.resume().then(() => {
        Tone.Transport.start()
        gain.gain.exponentialRampTo(0.01, 0.5)
        voices.forEach(voice => {
          voice.start()
        })
      })
    }

    window.addEventListener('keydown', keyDown)
    window.addEventListener('touchend', keyDown)
    window.addEventListener('click', keyDown)

    const loopTime = 4
    const rampTime = 1.5

    let loop = new Tone.Loop(time => {
      const numbers = pickNFrom16(4).sort((a, b) => a - b)
      const notes = numbers.map(el => Tone.Frequency.mtof(noteScale(el) + 40))
      voices.forEach((voice, i) => {
        voice.rampTo(notes[i], rampTime)
      })
    }, loopTime).start(0)

    let cameraPosition = new THREE.Vector3(0, 0, 0)

    const filterRampTime = 0.05

    let animate = function() {
      requestAnimationFrame(animate)
      p += 0.1
      shader.uniforms.p.value = p

      const freqs = voices.map(voice => voice.getFrequency())
      world.update(new Float32Array(freqs))
      geometry.attributes.color.needsUpdate = true
      renderer.render(scene, camera)
    }

    animate()
  })
  .catch(console.error)
