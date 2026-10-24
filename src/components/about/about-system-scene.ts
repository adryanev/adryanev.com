import * as THREE from 'three'
import { createGltfLoader } from '@/lib/gltf-loader'

export type AboutSystemScene = {
  select: (index: number) => void
  setVisible: (visible: boolean) => void
  setMotion: (enabled: boolean) => void
  dispose: () => void
}

type SceneOptions = {
  canvas: HTMLCanvasElement
  signal: AbortSignal
  motionEnabled: boolean
  onSelect: (index: number) => void
  onFailure: () => void
}

function disposeModel(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.geometry.dispose()
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => material.dispose())
  })
}

export async function mountAboutSystemScene(options: SceneOptions): Promise<AboutSystemScene> {
  const { canvas, signal, onSelect } = options
  signal.throwIfAborted()
  const response = await fetch('/models/about-system.glb', {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
  })
  if (!response.ok) throw new Error(`About model returned ${response.status}`)
  const bytes = await response.arrayBuffer()
  signal.throwIfAborted()
  const model = await createGltfLoader().parseAsync(bytes, '')
  if (signal.aborted) {
    disposeModel(model.scene)
    signal.throwIfAborted()
  }

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  } catch (error) {
    disposeModel(model.scene)
    throw error
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.7

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, 0.1, 100)
  camera.position.set(8.6, 5.6, 11.5)
  camera.lookAt(0, 0, 0)
  scene.add(new THREE.AmbientLight(0xffffff, 2.1))
  const key = new THREE.DirectionalLight(0xffffff, 3.7)
  key.position.set(-4, 9, 8)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x8fd9e3, 1.5)
  rim.position.set(5, 6, -4)
  scene.add(rim)

  const bounds = new THREE.Box3().setFromObject(model.scene)
  model.scene.position.sub(bounds.getCenter(new THREE.Vector3()))
  const turntable = new THREE.Group()
  turntable.add(model.scene)
  scene.add(turntable)
  const rigs = ['ApplicationsRig', 'BackendRig', 'DeliveryRig'].map((name) => {
    const object = model.scene.getObjectByName(name)
    return object ? { object, restY: object.position.y } : null
  })
  const mixer = new THREE.AnimationMixer(model.scene)
  model.animations.forEach((clip) => mixer.clipAction(clip).play())

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let selected = 0
  let visible = true
  let motionEnabled = options.motionEnabled
  let disposed = false
  let frame = 0
  let lastTime = 0
  let targetYaw = 0
  let pointerDown: { x: number; y: number; yaw: number; id: number } | null = null

  const draw = (time: number) => {
    frame = 0
    if (disposed || !visible || document.hidden) return
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0
    lastTime = time
    if (motionEnabled) mixer.update(delta)
    const blend = motionEnabled ? 1 - Math.exp(-10 * delta) : 1
    turntable.rotation.y = THREE.MathUtils.lerp(turntable.rotation.y, targetYaw, blend)
    rigs.forEach((rig, index) => {
      if (rig) rig.object.position.y = THREE.MathUtils.lerp(rig.object.position.y, rig.restY + (index === selected ? 0.08 : 0), blend)
    })
    renderer.render(scene, camera)
    if (motionEnabled) frame = window.requestAnimationFrame(draw)
  }
  const invalidate = () => {
    if (!frame && !disposed && visible && !document.hidden) frame = window.requestAnimationFrame(draw)
  }
  const select = (index: number) => {
    selected = index
    invalidate()
  }
  const pick = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObject(turntable, true)
    for (const hit of hits) {
      let object: THREE.Object3D | null = hit.object
      while (object && object !== turntable) {
        const index = rigs.findIndex((rig) => rig?.object === object)
        if (index >= 0) return index
        object = object.parent
      }
    }
    return -1
  }
  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return
    pointerDown = { x: event.clientX, y: event.clientY, yaw: targetYaw, id: event.pointerId }
    canvas.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: PointerEvent) => {
    if (pointerDown?.id === event.pointerId) {
      const distance = event.clientX - pointerDown.x
      if (Math.abs(distance) > 6 && motionEnabled) {
        targetYaw = THREE.MathUtils.clamp(pointerDown.yaw + distance / canvas.clientWidth * 1.2, -0.42, 0.42)
        canvas.style.cursor = 'grabbing'
        invalidate()
      }
      return
    }
    canvas.style.cursor = pick(event) >= 0 ? 'pointer' : 'grab'
  }
  const onPointerUp = (event: PointerEvent) => {
    const start = pointerDown
    pointerDown = null
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    canvas.style.cursor = 'grab'
    if (!start || start.id !== event.pointerId || Math.abs(event.clientX - start.x) > 6 || Math.abs(event.clientY - start.y) > 6) return
    const index = pick(event)
    if (index >= 0) onSelect(index)
  }
  const clearPointer = () => { pointerDown = null; canvas.style.cursor = 'grab' }
  const resize = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (!width || !height) return
    const aspect = width / height
    const viewHeight = Math.max(3.8, 11.2 / aspect)
    camera.left = -viewHeight * aspect / 2
    camera.right = viewHeight * aspect / 2
    camera.top = viewHeight / 2
    camera.bottom = -viewHeight / 2
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    invalidate()
  }
  const visibilityChanged = () => {
    if (document.hidden) {
      window.cancelAnimationFrame(frame)
      frame = 0
    }
    lastTime = 0
    invalidate()
  }
  const contextLost = (event: Event) => {
    event.preventDefault()
    dispose()
    options.onFailure()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', clearPointer)
  canvas.addEventListener('webglcontextlost', contextLost)
  document.addEventListener('visibilitychange', visibilityChanged)

  function dispose() {
    if (disposed) return
    disposed = true
    window.cancelAnimationFrame(frame)
    observer.disconnect()
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', clearPointer)
    canvas.removeEventListener('webglcontextlost', contextLost)
    document.removeEventListener('visibilitychange', visibilityChanged)
    signal.removeEventListener('abort', dispose)
    mixer.stopAllAction()
    mixer.uncacheRoot(model.scene)
    disposeModel(model.scene)
    renderer.dispose()
  }
  signal.addEventListener('abort', dispose, { once: true })
  resize()

  return {
    select,
    setVisible(nextVisible) {
      visible = nextVisible
      lastTime = 0
      if (!visible) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
      invalidate()
    },
    setMotion(enabled) {
      motionEnabled = enabled
      lastTime = 0
      invalidate()
    },
    dispose,
  }
}
