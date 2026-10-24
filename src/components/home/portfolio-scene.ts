import * as THREE from 'three'
import { createGltfLoader } from '@/lib/gltf-loader'

export type SceneDestination = 'work' | 'writing' | 'contact'
export type PortfolioScene = {
  select: (destination: SceneDestination | null) => void
  setVisible: (visible: boolean) => void
  setMotion: (enabled: boolean) => void
  dispose: () => void
}

type SceneOptions = {
  canvas: HTMLCanvasElement
  signal: AbortSignal
  motionEnabled: boolean
  onSelect: (destination: SceneDestination | null) => void
  onNavigate: (destination: SceneDestination) => void
  onFailure: () => void
}

const destinations = new Map<string, SceneDestination>([
  ['WorkStation', 'work'],
  ['WritingDesk', 'writing'],
  ['LaunchStation', 'contact'],
])

function destinationFor(object: THREE.Object3D | null): SceneDestination | null {
  while (object) {
    const destination = destinations.get(object.name)
    if (destination) return destination
    object = object.parent
  }
  return null
}

function disposeModel(model: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    geometries.add(object.geometry)
    const meshMaterials = Array.isArray(object.material) ? object.material : [object.material]
    meshMaterials.forEach((material) => materials.add(material))
  })
  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((material) => material.dispose())
}

export async function mountPortfolioScene(options: SceneOptions): Promise<PortfolioScene> {
  const { canvas, signal, onSelect, onNavigate, onFailure } = options
  signal.throwIfAborted()
  // Loading is abortable and bounded; 3D must never hold up the portfolio.
  const response = await fetch('/models/portfolio-atelier.glb', {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
  })
  if (!response.ok) throw new Error(`Portfolio model returned ${response.status}`)
  const bytes = await response.arrayBuffer()
  signal.throwIfAborted()
  const model = await createGltfLoader().parseAsync(bytes, '')
  if (signal.aborted) {
    disposeModel(model.scene)
    signal.throwIfAborted()
  }

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch (error) {
    disposeModel(model.scene)
    throw error
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.18
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  const turntable = new THREE.Group()
  turntable.add(model.scene)
  scene.add(turntable)
  // glTF is Y-up; the authoring camera in Blender is Z-up.
  const camera = new THREE.OrthographicCamera(-3.625, 3.625, 2.72, -2.72, 0.1, 50)
  camera.position.set(6.7, 7, 9.3)
  camera.lookAt(0, 1.03, 0)
  scene.add(new THREE.HemisphereLight('#e1f5ff', '#bd9270', 2.1))
  const key = new THREE.DirectionalLight('#fff2d8', 3.5)
  key.position.set(-3.5, 7.5, 4.5)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.left = -4
  key.shadow.camera.right = 4
  key.shadow.camera.top = 4
  key.shadow.camera.bottom = -4
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 20
  key.shadow.normalBias = 0.02
  key.shadow.bias = -0.0002
  scene.add(key)
  const fill = new THREE.DirectionalLight('#b5e4ff', 1.5)
  fill.position.set(5, 3, -2)
  scene.add(fill)

  const meshes: THREE.Mesh[] = []
  model.scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.castShadow = true
    object.receiveShadow = true
    meshes.push(object)
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      if (material.name === 'Atelier_Page') material.side = THREE.DoubleSide
    })
  })
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.ShadowMaterial({ color: '#263d48', opacity: 0.13 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.075
  ground.receiveShadow = true
  scene.add(ground)

  const mixer = new THREE.AnimationMixer(model.scene)
  model.animations.forEach((clip) => mixer.clipAction(clip).play())
  const lid = model.scene.getObjectByName('WorkScreenPivot')
  const page = model.scene.getObjectByName('WritingPagePivot')
  const rocket = model.scene.getObjectByName('ContactRocketRig')
  const lidRest = lid?.rotation.x ?? 0
  const rocketRest = rocket?.position.y ?? 0
  let visible = true
  let motionEnabled = options.motionEnabled
  let disposed = false
  let selected: SceneDestination | null = null
  let frame = 0
  let lastTime = 0
  let entrance = motionEnabled ? 0 : 1
  let targetYaw = 0
  let pointerDown: { x: number; y: number; yaw: number; id: number } | null = null
  const pointer = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()

  const draw = (time: number) => {
    frame = 0
    if (disposed || !visible || document.hidden) return
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0
    lastTime = time
    if (motionEnabled) mixer.update(delta)
    entrance = motionEnabled ? Math.min(entrance + delta / 0.85, 1) : 1
    const open = 1 - Math.pow(1 - entrance, 4)
    const blend = motionEnabled ? 1 - Math.exp(-12 * delta) : 1
    if (lid) {
      const rest = lidRest + (selected === 'work' ? -0.07 : 0)
      lid.rotation.x = THREE.MathUtils.lerp(0.72, rest, open)
    }
    if (page) page.rotation.z = THREE.MathUtils.lerp(page.rotation.z, selected === 'writing' ? 0.20 : 0, blend)
    if (rocket) rocket.position.y = THREE.MathUtils.lerp(rocket.position.y, rocketRest + (selected === 'contact' ? 0.18 : 0), blend)
    turntable.rotation.y = THREE.MathUtils.lerp(turntable.rotation.y, targetYaw, blend)
    renderer.render(scene, camera)
    if (motionEnabled) frame = window.requestAnimationFrame(draw)
  }
  const invalidate = () => {
    if (!frame && !disposed && visible && !document.hidden) frame = window.requestAnimationFrame(draw)
  }
  const select = (destination: SceneDestination | null) => {
    selected = destination
    invalidate()
  }
  const pick = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect()
    pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    // First solid hit prevents selecting an object through the deck or laptop.
    const hit = raycaster.intersectObjects(meshes, false)[0]
    return hit ? destinationFor(hit.object) : null
  }
  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return
    pointerDown = { x: event.clientX, y: event.clientY, yaw: targetYaw, id: event.pointerId }
    canvas.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: PointerEvent) => {
    if (pointerDown && pointerDown.id === event.pointerId) {
      const dx = event.clientX - pointerDown.x
      if (Math.abs(dx) > 6) {
        targetYaw = THREE.MathUtils.clamp(pointerDown.yaw + dx / canvas.clientWidth * 1.7, -0.55, 0.55)
        canvas.style.cursor = 'grabbing'
        invalidate()
      }
      return
    }
    const destination = pick(event)
    canvas.style.cursor = destination ? 'pointer' : 'grab'
    if (selected !== destination) {
      select(destination)
      onSelect(destination)
    }
  }
  const onPointerUp = (event: PointerEvent) => {
    const start = pointerDown
    pointerDown = null
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    canvas.style.cursor = 'grab'
    if (!start || start.id !== event.pointerId || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 7) return
    const destination = pick(event)
    if (destination) onNavigate(destination)
  }
  const clearPointer = () => {
    pointerDown = null
    select(null)
    onSelect(null)
    canvas.style.cursor = 'grab'
  }
  const resize = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (!width || !height) return
    const aspect = width / height
    const viewHeight = Math.max(5.43, 7.25 / aspect)
    camera.left = -viewHeight * aspect / 2
    camera.right = viewHeight * aspect / 2
    camera.top = viewHeight / 2
    camera.bottom = -viewHeight / 2
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    invalidate()
  }
  const visibilityChanged = () => {
    if (document.hidden && frame) {
      window.cancelAnimationFrame(frame)
      frame = 0
    }
    lastTime = 0
    invalidate()
  }
  const contextLost = (event: Event) => {
    event.preventDefault()
    dispose()
    onFailure()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', clearPointer)
  canvas.addEventListener('pointerleave', clearPointer)
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
    canvas.removeEventListener('pointerleave', clearPointer)
    canvas.removeEventListener('webglcontextlost', contextLost)
    document.removeEventListener('visibilitychange', visibilityChanged)
    signal.removeEventListener('abort', dispose)
    mixer.stopAllAction()
    mixer.uncacheRoot(model.scene)
    disposeModel(model.scene)
    ground.geometry.dispose()
    ground.material.dispose()
    key.shadow.map?.dispose()
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
