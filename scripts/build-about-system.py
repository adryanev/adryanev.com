"""Build the About-page software-system model in an isolated Blender process.

The model is an explorable assembly: application interface, API/data core,
delivery rack, and a visible signal route. Run with Blender --background --python.
"""

from pathlib import Path
import math

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
BLEND_PATH = ROOT / "assets/blender/about-system.blend"
GLB_PATH = ROOT / "public/models/about-system.glb"
RENDER_PATH = ROOT / ".impeccable/previews/about-system-blender.png"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 120
scene.render.fps = 30

model_collection = bpy.data.collections.new("About System / export")
scene.collection.children.link(model_collection)


def to_linear(value):
    value = value / 255
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def material(name, hex_color, metal=0.0, rough=0.56, emission=0.0):
    color = tuple(int(hex_color[i : i + 2], 16) for i in (1, 3, 5))
    rgba = tuple(to_linear(channel) for channel in color) + (1.0,)
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    node = next(node for node in mat.node_tree.nodes if node.type == "BSDF_PRINCIPLED")
    node.inputs["Base Color"].default_value = rgba
    node.inputs["Metallic"].default_value = metal
    node.inputs["Roughness"].default_value = rough
    if emission:
        node.inputs["Emission Color"].default_value = rgba
        node.inputs["Emission Strength"].default_value = emission
    mat.diffuse_color = rgba
    return mat


ink = material("01 / ink enamel", "#142027", metal=0.12)
dark = material("02 / graphite mechanics", "#314b55", metal=0.45, rough=0.42)
paper = material("03 / warm porcelain", "#fff8e7", rough=0.72)
yellow = material("04 / application yellow", "#f6ce4a", rough=0.43)
blue = material("05 / data blue", "#8fd9e3", rough=0.42)
red = material("06 / delivery red", "#cf3924", rough=0.44)
light = material("07 / signal light", "#f6ce4a", emission=1.8)


def move_to_collection(obj):
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)
    model_collection.objects.link(obj)
    return obj


def empty(name, location=(0, 0, 0), parent=None):
    obj = bpy.data.objects.new(name, None)
    model_collection.objects.link(obj)
    obj.location = location
    obj.parent = parent
    return obj


assembly = empty("AboutAssembly")
applications = empty("ApplicationsRig", parent=assembly)
backend = empty("BackendRig", parent=assembly)
delivery = empty("DeliveryRig", parent=assembly)


def box(name, location, size, mat, parent=assembly, bevel=0.05):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = move_to_collection(bpy.context.object)
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new("Machined edge", "BEVEL")
        modifier.width = bevel
        modifier.segments = 2
        obj.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")
    obj.data.materials.append(mat)
    obj.parent = parent
    return obj


def cylinder(name, location, radius, depth, mat, parent=assembly, vertices=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location)
    obj = move_to_collection(bpy.context.object)
    obj.name = name
    bevel = obj.modifiers.new("Machined rim", "BEVEL")
    bevel.width = min(0.035, depth * 0.2)
    bevel.segments = 2
    obj.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")
    obj.data.materials.append(mat)
    obj.parent = parent
    return obj


def tube(name, points, radius, mat, parent=assembly):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 18
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, coordinate in zip(spline.points, points):
        point.co = (*coordinate, 1)
    obj = bpy.data.objects.new(name, curve)
    model_collection.objects.link(obj)
    obj.data.materials.append(mat)
    obj.parent = parent
    return obj


def label(name, text, location, size, mat, parent=assembly):
    curve = bpy.data.curves.new(name, "FONT")
    curve.body = text
    curve.size = size
    curve.extrude = 0.001
    obj = bpy.data.objects.new(name, curve)
    model_collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler.x = math.pi / 2
    obj.data.materials.append(mat)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    obj = bpy.context.object
    obj.parent = parent
    return obj


# One continuous chassis makes the three disciplines read as one system.
box("Continuous chassis", (0, 0, 0), (8.9, 3.45, 0.28), ink, bevel=0.18)
box("Inset work deck", (0, 0, 0.18), (8.62, 3.17, 0.1), paper, bevel=0.08)
for x, accent in ((-2.9, yellow), (0, blue), (2.9, red)):
    box(f"Inset bay / {x}", (x, 0.0, 0.245), (2.52, 2.85, 0.045), accent, bevel=0.08)
    for y in (-1.2, 1.2):
        cylinder(f"Deck fastener / {x} / {y}", (x - 1.05, y, 0.3), 0.045, 0.015, ink)
        cylinder(f"Deck fastener / {x} / {y} / right", (x + 1.05, y, 0.3), 0.045, 0.015, ink)
box("Front title rail", (0, -1.72, 0.03), (8.72, 0.075, 0.17), dark, bevel=0.025)
label("Application title", "APPLICATIONS", (-3.88, -1.77, -0.03), 0.16, paper)
label("Backend title", "BACKEND", (-0.75, -1.77, -0.03), 0.16, paper)
label("Delivery title", "DELIVERY", (2.1, -1.77, -0.03), 0.16, paper)

# Application side: one desktop interface and a separate mobile viewport.
box("Display arm", (-3.0, 0.56, 0.82), (0.14, 0.48, 0.9), dark, applications)
box("Display frame", (-3.0, 0.55, 1.76), (1.86, 0.14, 1.35), ink, applications, bevel=0.08)
box("Display glass", (-3.0, 0.455, 1.76), (1.66, 0.02, 1.15), blue, applications, bevel=0.02)
box("Window bar", (-3.0, 0.438, 2.22), (1.54, 0.025, 0.1), paper, applications, bevel=0.015)
for x, width, accent in ((-3.35, 0.62, yellow), (-3.28, 0.75, paper), (-3.4, 0.5, paper)):
    index = (-3.35, -3.28, -3.4).index(x)
    box(f"Interface row {index}", (x, 0.435, 1.98 - index * 0.19), (width, 0.03, 0.08), accent, applications, bevel=0.012)
box("Interface detail panel", (-2.52, 0.432, 1.67), (0.48, 0.03, 0.48), paper, applications, bevel=0.02)
box("Mobile frame", (-1.97, -0.69, 1.05), (0.57, 0.12, 1.12), ink, applications, bevel=0.09)
box("Mobile glass", (-1.97, -0.775, 1.06), (0.47, 0.024, 0.93), paper, applications, bevel=0.06)
box("Mobile header", (-1.97, -0.796, 1.38), (0.34, 0.02, 0.1), red, applications, bevel=0.015)
for index in range(3):
    box(f"Mobile row {index}", (-1.98, -0.799, 1.15 - index * 0.17), (0.3, 0.02, 0.06), blue, applications, bevel=0.01)
box("Input console", (-3.22, -0.78, 0.46), (1.3, 0.9, 0.1), ink, applications, bevel=0.06)
for index in range(5):
    box(f"Input key {index}", (-3.64 + index * 0.22, -0.77, 0.53), (0.14, 0.47, 0.035), paper, applications, bevel=0.018)

# Backend: the data core has service layers, accessible ports and a rotor.
cylinder("Core foot", (0, 0.15, 0.49), 0.76, 0.35, ink, backend)
for index in range(4):
    z = 0.71 + index * 0.33
    cylinder(f"Data layer {index}", (0, 0.15, z), 0.67, 0.25, paper if index % 2 == 0 else dark, backend)
    cylinder(f"Data seam {index}", (0, 0.15, z + 0.13), 0.71, 0.05, blue, backend)
    box(f"Service indicator {index}", (-0.18, -0.5, z), (0.12, 0.045, 0.055), yellow, backend, bevel=0.01)
    box(f"Service port {index}", (0.13, -0.5, z), (0.2, 0.045, 0.07), ink, backend, bevel=0.012)
cylinder("Core cap", (0, 0.15, 2.09), 0.71, 0.16, ink, backend)
backend_rotor = empty("BackendRotor", (0, 0.15, 1.42), backend)
bpy.ops.mesh.primitive_torus_add(major_radius=0.94, minor_radius=0.06, location=(0, 0.15, 1.42))
ring = move_to_collection(bpy.context.object)
ring.name = "Service ring"
ring.data.materials.append(yellow)
ring.parent = backend_rotor
# Parent inverse keeps the ring centered on the rotor while it turns.
ring.matrix_parent_inverse = backend_rotor.matrix_world.inverted()
ring_marker = box("Ring marker", (0.94, 0.15, 1.42), (0.22, 0.2, 0.14), red, backend_rotor, bevel=0.025)
ring_marker.location = (0.94, 0, 0)

# Delivery: three physical release cassettes, one slides when selected.
box("Deployment rack", (2.88, 0.16, 1.23), (1.95, 1.58, 1.68), ink, delivery, bevel=0.08)
box("Rack inset", (2.88, -0.66, 1.23), (1.72, 0.055, 1.43), dark, delivery, bevel=0.04)
for index in range(3):
    z = 0.74 + index * 0.46
    drawer_parent = delivery
    if index == 1:
        drawer_parent = empty("DeliveryDrawer", parent=delivery)
    box(f"Release cassette {index}", (2.88, -0.73, z), (1.5, 0.22, 0.33), paper, drawer_parent, bevel=0.035)
    box(f"Cassette grip {index}", (2.57, -0.855, z), (0.42, 0.025, 0.05), ink, drawer_parent, bevel=0.012)
    for light_index, accent in enumerate((blue, yellow, red)):
        cylinder(f"Status lamp {index}-{light_index}", (3.19 + light_index * 0.15, -0.856, z), 0.04, 0.022, accent, drawer_parent, vertices=16).rotation_euler.x = math.pi / 2
for index in range(6):
    box(f"Rack vent {index}", (3.87, -0.25 + index * 0.13, 1.4), (0.02, 0.08, 0.52), dark, delivery, bevel=0.005)
box("Rack top", (2.88, 0.16, 2.1), (2.0, 1.64, 0.15), paper, delivery, bevel=0.06)

# The conduit makes the sequence legible, and one packet carries the motion.
tube("Shared signal conduit", [(-3.0, -1.18, 0.55), (-2.1, -1.18, 0.55), (-1.5, -1.18, 0.55), (0, -1.18, 0.55), (1.5, -1.18, 0.55), (2.88, -1.18, 0.55)], 0.07, dark)
for x, accent in ((-3.0, yellow), (0, blue), (2.88, red)):
    cylinder(f"Conduit junction {x}", (x, -1.18, 0.56), 0.16, 0.1, accent)
signal = box("SignalPacket", (-3.0, -1.18, 0.69), (0.18, 0.18, 0.18), light, bevel=0.035)


def keyframe(obj, frame, prop):
    obj.keyframe_insert(data_path=prop, frame=frame)


backend_rotor.rotation_euler.z = 0
keyframe(backend_rotor, 1, "rotation_euler")
backend_rotor.rotation_euler.z = math.tau
keyframe(backend_rotor, 120, "rotation_euler")
drawer = bpy.data.objects["DeliveryDrawer"]
for frame, y in ((1, 0), (70, 0), (85, -0.28), (105, -0.28), (120, 0)):
    drawer.location.y = y
    keyframe(drawer, frame, "location")
for frame, x, scale in ((1, -3.0, 0.01), (10, -3.0, 1.0), (58, 0, 1.0), (104, 2.88, 1.0), (115, 2.88, 0.01), (120, -3.0, 0.01)):
    signal.location.x = x
    signal.scale = (scale, scale, scale)
    keyframe(signal, frame, "location")
    keyframe(signal, frame, "scale")
for obj in (backend_rotor, drawer, signal):
    if obj.animation_data and obj.animation_data.action:
        obj.animation_data.action.name = "AboutSystemMotion / " + obj.name

# A camera and lights exist only in the .blend preview, not in the GLB.
bpy.ops.object.camera_add(location=(9.5, -14.5, 9.2))
camera = bpy.context.object
camera.name = "Preview camera"
direction = Vector((0, 0, 1.0)) - camera.location
camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
camera.data.type = "ORTHO"
camera.data.ortho_scale = 11.2
scene.camera = camera
for name, location, power, size in (("Key", (-5, -7, 9), 1400, 8), ("Fill", (5, 2, 8), 950, 7)):
    bpy.ops.object.light_add(type="AREA", location=location)
    lamp = bpy.context.object
    lamp.name = name
    lamp.data.energy = power
    lamp.data.shape = "DISK"
    lamp.data.size = size
    direction = Vector((0, 0, 0.5)) - lamp.location
    lamp.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()

scene.world = bpy.data.worlds.new("Warm studio")
scene.world.use_nodes = True
background = next(node for node in scene.world.node_tree.nodes if node.type == "BACKGROUND")
background.inputs["Color"].default_value = (0.56, 0.65, 0.67, 1)
background.inputs["Strength"].default_value = 0.5
scene.render.engine = "CYCLES"
scene.cycles.samples = 24
scene.render.resolution_x = 1400
scene.render.resolution_y = 750
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = str(RENDER_PATH)
scene.frame_set(30)

BLEND_PATH.parent.mkdir(parents=True, exist_ok=True)
GLB_PATH.parent.mkdir(parents=True, exist_ok=True)
RENDER_PATH.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))

bpy.ops.object.select_all(action="DESELECT")
for obj in model_collection.objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = assembly
bpy.ops.export_scene.gltf(filepath=str(GLB_PATH), export_format="GLB", use_selection=True, export_animations=True, export_apply=True)
bpy.ops.render.render(write_still=True)

print(f"ABOUT_MODEL_BLEND={BLEND_PATH}")
print(f"ABOUT_MODEL_GLB={GLB_PATH}")
print(f"ABOUT_MODEL_PREVIEW={RENDER_PATH}")
print(f"ABOUT_MODEL_OBJECTS={len(model_collection.objects)}")
