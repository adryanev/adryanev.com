import * as THREE from 'three'
import { createGltfLoader } from '@/lib/gltf-loader'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { WorktableRole } from './ResumeWorktable'
import { experiencePoints } from './experience-points'

type MountOptions = {
  canvas: HTMLCanvasElement
  roles: WorktableRole[]
  selected: number
  signal: AbortSignal
  motionEnabled: boolean
  onSelect: (index: number) => void
}

function drawPlate(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas')
  const scale = 240
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  ctx.scale(scale, scale)
  draw(ctx)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, depthWrite: false })
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material)
}

function fitLines(ctx: CanvasRenderingContext2D, value: string, width: number) {
  const words = value.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > width) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function roleDate(role: WorktableRole) {
  const start = role.job.startDate?.slice(0, 4) ?? 'Undated'
  return role.job.endDate ? `${start}–${role.job.endDate.slice(0, 4)}` : `${start}–now`
}

function meshRole(object: THREE.Object3D, root: THREE.Object3D) {
  let current: THREE.Object3D | null = object
  while (current && current !== root) {
    const match = /^Role[ _](\d+)/.exec(current.name)
    if (match) return Number(match[1])
    current = current.parent
  }
  return null
}

export async function mountResumeWorktableScene({ canvas, roles, selected, signal, motionEnabled, onSelect }: MountOptions) {
  const roleMap = new Map(roles.map((role) => [role.index, role]))
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  camera.position.set(0, 4.7, 11)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x364d51, 2.4))
  const light = new THREE.DirectionalLight(0xffffff, 2.1)
  light.position.set(-3, 8, 6)
  scene.add(light)

  const controls = new OrbitControls(camera, canvas)
  controls.enablePan = false
  controls.enableZoom = false
  controls.enableDamping = true
  controls.minPolarAngle = 0.55
  controls.maxPolarAngle = 1.5
  controls.target.set(0, 0.7, 0)
  controls.update()

  let model: THREE.Group
  try {
    const gltf = await createGltfLoader().loadAsync('/models/resume-worktable.glb')
    model = gltf.scene
    if (signal.aborted) {
      renderer.dispose()
      controls.dispose()
      throw new Error('Resume scene load cancelled')
    }
  } catch (error) {
    renderer.dispose()
    controls.dispose()
    throw error
  }

  scene.add(model)
  const roleMeshes: THREE.Mesh[] = []
  const trayMeshes: THREE.Mesh[] = []
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    if (Array.isArray(object.material)) return
    object.material = object.material.clone()
    object.userData.baseX = object.position.x
    object.userData.baseZ = object.position.z
    if ('color' in object.material && object.material.color instanceof THREE.Color) {
      object.userData.baseColor = object.material.color.clone()
    }
    if (meshRole(object, model) !== null) roleMeshes.push(object)
    if (object.name.startsWith('Reveal')) trayMeshes.push(object)
  })

  const overlay = new THREE.Group()
  scene.add(overlay)
  for (const role of roles) {
    const [x, depth, height] = role.position
    const plate = drawPlate(1.05, 0.46, (ctx) => {
      ctx.fillStyle = role.job.endDate === null ? '#d8f3f1' : '#fff8e7'
      ctx.beginPath()
      ctx.roundRect(0.01, 0.01, 1.03, 0.44, 0.05)
      ctx.fill()
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#47575c'
      ctx.font = 'bold 0.16px "DM Mono", monospace'
      ctx.fillText(role.job.startDate?.slice(0, 4) ?? '—', 0.08, 0.14, 0.89)
      ctx.fillStyle = '#142027'
      ctx.font = 'bold 0.19px "Bricolage Grotesque", sans-serif'
      ctx.fillText(role.short, 0.08, 0.33, 0.89)
    })
    plate.position.set(x, height + 1.16, -depth + 0.12)
    overlay.add(plate)
  }

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.48, 0.54, 48),
    new THREE.MeshBasicMaterial({ color: '#cf3924', side: THREE.DoubleSide, depthWrite: false }),
  )
  ring.rotation.x = -Math.PI / 2
  overlay.add(ring)

  let record: THREE.Mesh | null = null
  let currentSelected = selected
  let currentPointIndex = 0
  let visible = false
  let motion = motionEnabled
  let frame = 0
  let pull = 0
  let targetPull = 1
  const pointer = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()
  let down: { x: number; y: number } | null = null

  const mobileFocus = () => canvas.clientWidth < 600 ? roleMap.get(currentSelected)?.position[0] ?? 0 : 0

  const updateRecord = () => {
    const role = roleMap.get(currentSelected)
    if (!role) return
    if (record) {
      overlay.remove(record)
      record.geometry.dispose()
      const material = record.material as THREE.MeshBasicMaterial
      material.map?.dispose()
      material.dispose()
    }
    const points = experiencePoints(role.job.description)
    record = drawPlate(4.15, 1.9, (ctx) => {
      ctx.fillStyle = '#fff8e7'
      ctx.beginPath()
      ctx.roundRect(0.035, 0.035, 4.08, 1.83, 0.06)
      ctx.fill()
      ctx.fillStyle = '#f6ce4a'
      ctx.fillRect(0.035, 0.035, 0.09, 1.83)
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#445057'
      ctx.font = 'bold 0.18px "DM Mono", monospace'
      ctx.fillText(`${roleDate(role)}  /  ${role.job.organization ?? ''}`, 0.25, 0.33, 3.65)
      ctx.fillStyle = '#142027'
      ctx.font = 'bold 0.30px "Bricolage Grotesque", sans-serif'
      ctx.fillText(role.job.title, 0.25, 0.70, 3.65)
      ctx.fillStyle = '#263a42'
      const point = points[currentPointIndex] ?? 'Read the full experience below.'
      let size = 0.18
      let lines: string[]
      do {
        ctx.font = `${size}px "Bricolage Grotesque", sans-serif`
        lines = fitLines(ctx, point, 3.55)
        if (lines.length <= 4) break
        size -= 0.01
      } while (size > 0.09)
      lines.forEach((line, index) => {
        ctx.fillText(line, 0.30, 1.04 + index * Math.min(0.21, size * 1.23), 3.55)
      })
      ctx.fillStyle = '#445057'
      ctx.font = 'bold 0.14px "DM Mono", monospace'
      ctx.fillText(points.length ? `POINT ${currentPointIndex + 1} / ${points.length}` : 'NO POINTS', 0.30, 1.73)
    })
    record.rotation.x = -0.45
    overlay.add(record)
  }

  const updateSelection = (index: number, pointIndex = 0) => {
    if (!roleMap.has(index)) return
    currentSelected = index
    currentPointIndex = Math.max(0, Math.min(pointIndex, experiencePoints(roleMap.get(index)!.job.description).length - 1))
    if (currentPointIndex < 0) currentPointIndex = 0
    if (pointIndex === 0) pull = motion ? 0 : 1
    targetPull = 1
    updateRecord()
    const role = roleMap.get(index)!
    const [x, depth, height] = role.position
    ring.position.set(x, height + 0.02, -depth)
    for (const object of roleMeshes) {
      const objectRole = meshRole(object, model)
      const material = object.material as THREE.MeshStandardMaterial
      if (object.userData.baseColor && material.color) {
        material.color.copy(object.userData.baseColor)
        if (objectRole === index) material.color.lerp(new THREE.Color('#fff8e7'), 0.3)
      }
      material.opacity = objectRole === index ? 1 : 0.65
      material.transparent = objectRole !== index
    }
    resize()
  }

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width))
    const height = Math.max(1, Math.round(rect.height))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    const focus = mobileFocus()
    camera.position.x = focus
    controls.target.x = focus
    camera.position.z = width < 600 ? 10.5 : 11
    camera.updateProjectionMatrix()
    controls.update()
    render()
  }

  const render = () => {
    if (!record) return
    const focus = mobileFocus()
    record.position.set(focus, 1.28, 2.75 + (pull - 1) * 1.2)
    record.visible = pull > 0.15
    for (const object of trayMeshes) {
      object.position.x = object.userData.baseX + focus
      object.position.z = object.userData.baseZ + (pull - 1) * 1.2
    }
    for (const object of roleMeshes) {
      object.position.z = object.userData.baseZ + (meshRole(object, model) === currentSelected ? 0.42 * pull : 0)
    }
    model.rotation.y = motion ? Math.sin(performance.now() / 4200) * 0.012 : 0
    controls.update()
    renderer.render(scene, camera)
  }

  const tick = () => {
    frame = 0
    if (!visible) return
    pull += (targetPull - pull) * (motion ? 0.16 : 1)
    render()
    frame = requestAnimationFrame(tick)
  }

  const pointerDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY } }
  const pointerUp = (event: PointerEvent) => {
    if (!down || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 7) { down = null; return }
    down = null
    const rect = canvas.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const index = raycaster.intersectObject(model, true).map((hit) => meshRole(hit.object, model)).find((value) => value !== null && roleMap.has(value))
    if (index !== undefined && index !== null) onSelect(index)
  }

  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  canvas.addEventListener('pointerdown', pointerDown)
  canvas.addEventListener('pointerup', pointerUp)
  updateSelection(currentSelected)

  return {
    select: updateSelection,
    setVisible(next: boolean) { visible = next; if (next && !frame) frame = requestAnimationFrame(tick); if (!next && frame) { cancelAnimationFrame(frame); frame = 0 } },
    setMotion(next: boolean) { motion = next; if (!next) pull = targetPull; render() },
    dispose() {
      visible = false
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      canvas.removeEventListener('pointerdown', pointerDown)
      canvas.removeEventListener('pointerup', pointerUp)
      controls.dispose()
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        object.geometry.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        for (const material of materials) {
          if (material instanceof THREE.MeshBasicMaterial) material.map?.dispose()
          material.dispose()
        }
      })
      renderer.dispose()
    },
  }
}
