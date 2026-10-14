import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { WorkCategory } from './work-types'

function disposeScene(scene: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    geometries.add(object.geometry)
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material)
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value)
    }
  })
  textures.forEach((texture) => texture.dispose())
  materials.forEach((material) => material.dispose())
  geometries.forEach((geometry) => geometry.dispose())
}

function categoryLabel(name: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 128
  const context = canvas.getContext('2d')!
  context.fillStyle = '#fff8e7'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '600 70px "Bricolage Grotesque", sans-serif'
  context.fillText(name.toUpperCase(), 512, 64, 980)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(1.68, 0.21),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
  )
  label.position.set(0, 0.18, 0.703)
  return label
}

export async function mountWorkArchive({ canvas, categories, selected, signal, motion, onSelect, onContextLost }: {
  canvas: HTMLCanvasElement
  categories: WorkCategory[]
  selected: string | null
  signal: AbortSignal
  motion: boolean
  onSelect: (slug: string) => void
  onContextLost: () => void
}) {
  const { scene: model } = await new GLTFLoader().loadAsync('/models/work-archive.glb')
  await document.fonts.ready
  if (signal.aborted) { disposeScene(model); throw new Error('Work archive load cancelled') }
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  } catch (error) { disposeScene(model); throw error }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  const scene = new THREE.Scene()
  scene.add(model)
  scene.add(new THREE.HemisphereLight('#fff9e9', '#ada38b', 2.4))
  const key = new THREE.DirectionalLight('#fff6df', 3)
  key.position.set(-3, 7, 4)
  scene.add(key)
  const fill = new THREE.DirectionalLight('#d0edff', 1.4)
  fill.position.set(5, 3, -4)
  scene.add(fill)
  const camera = new THREE.OrthographicCamera(-5, 5, 3.4, -3.4, 0.1, 100)
  camera.position.set(7.8, 10, 11)
  camera.lookAt(0, 0.4, 0)

  const templates = Array.from({ length: 6 }, (_, index) => model.getObjectByName(`Category_${index}`)!)
  const rows = Math.max(2, Math.ceil(categories.length / 3))
  const depth = 3.8 + (rows - 2) * 1.83
  for (const name of ['Archive_plinth', 'Ink_foundation']) {
    const base = model.getObjectByName(name)
    if (base) base.scale.z = depth / 3.8
  }
  const folders = categories.map((category, index) => {
    const folder = templates[index % templates.length].clone(true)
    folder.name = `WorkCategory_${category.id}`
    folder.position.set((index % 3 - 1) * 2.35, 0.25, 0.83 - Math.floor(index / 3) * 1.83 + (rows - 2) * 1.83 / 2)
    folder.traverse((object) => { if (object.name.startsWith('Label_')) object.visible = false })
    folder.add(categoryLabel(category.name))
    model.add(folder)
    return { folder, slug: category.slug, restY: folder.position.y }
  })
  templates.forEach((template) => { template.visible = false })

  let current = selected
  let visible = false
  let moving = motion
  let disposed = false
  let lost = false
  let frame = 0
  let last = 0
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let down: { x: number; y: number } | null = null

  const apply = (blend: number) => {
    let unsettled = false
    for (const { folder, slug, restY } of folders) {
      const target = restY + (slug === current ? 0.32 : 0)
      folder.position.y = THREE.MathUtils.lerp(folder.position.y, target, blend)
      if (Math.abs(folder.position.y - target) < 0.0001) folder.position.y = target
      else unsettled = true
    }
    return unsettled
  }
  const draw = (time: number) => {
    frame = 0
    if (disposed || lost || !visible) return
    const delta = last ? Math.min((time - last) / 1000, 0.05) : 1 / 60
    last = time
    const unsettled = apply(moving ? 1 - Math.exp(-10 * delta) : 1)
    renderer.render(scene, camera)
    if (unsettled) frame = requestAnimationFrame(draw)
  }
  const invalidate = () => {
    if (!frame && visible && !disposed && !lost) frame = requestAnimationFrame(draw)
  }
  const resize = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (!width || !height || disposed || lost) return
    const aspect = width / height
    const viewHeight = Math.max(5.65, 9.55 / aspect) + (rows - 2) * 1.83
    camera.left = -viewHeight * aspect / 2
    camera.right = viewHeight * aspect / 2
    camera.top = viewHeight / 2
    camera.bottom = -viewHeight / 2
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    if (!moving) apply(1)
    if (visible) renderer.render(scene, camera)
    invalidate()
  }
  const categoryAt = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(folders.map(({ folder }) => folder), true).find(({ object }) => object.visible)
    let object = hit?.object
    while (object) {
      const match = folders.find(({ folder }) => folder === object)
      if (match) return match.slug
      object = object.parent ?? undefined
    }
    return null
  }
  const pointerDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY } }
  const pointerUp = (event: PointerEvent) => {
    const click = down && Math.hypot(event.clientX - down.x, event.clientY - down.y) <= 8
    down = null
    if (click) { const slug = categoryAt(event); if (slug) onSelect(slug) }
  }
  const pointerCancel = () => { down = null }
  const pointerMove = (event: PointerEvent) => { canvas.style.cursor = categoryAt(event) ? 'pointer' : 'default' }
  const contextLost = (event: Event) => {
    event.preventDefault()
    lost = true
    cancelAnimationFrame(frame)
    frame = 0
    onContextLost()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  canvas.addEventListener('pointerdown', pointerDown)
  canvas.addEventListener('pointerup', pointerUp)
  canvas.addEventListener('pointercancel', pointerCancel)
  canvas.addEventListener('pointermove', pointerMove)
  canvas.addEventListener('webglcontextlost', contextLost)
  resize()

  return {
    select(slug: string | null) { current = slug; last = 0; if (!moving) apply(1); invalidate() },
    setVisible(next: boolean) {
      visible = next
      last = 0
      if (next) { resize(); invalidate() }
      else { cancelAnimationFrame(frame); frame = 0 }
    },
    setMotion(next: boolean) { moving = next; if (!next) apply(1); invalidate() },
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      canvas.removeEventListener('pointerdown', pointerDown)
      canvas.removeEventListener('pointerup', pointerUp)
      canvas.removeEventListener('pointercancel', pointerCancel)
      canvas.removeEventListener('pointermove', pointerMove)
      canvas.removeEventListener('webglcontextlost', contextLost)
      disposeScene(scene)
      renderer.dispose()
    },
  }
}
