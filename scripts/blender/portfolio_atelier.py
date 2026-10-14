"""Build the portfolio's ligne-claire workstation in a new Blender scene.

Set portfolio_output_directory on the current scene to the repository root before
running. The existing scene is retained. Geometry, materials, and animation stay
editable in the saved .blend; the browser consumes the exported GLB.
"""

import bpy
import math
from mathutils import Vector


output_directory = bpy.context.scene.get('portfolio_output_directory', bpy.path.abspath('//'))
scene = bpy.data.scenes.new('Portfolio_Atelier')
bpy.context.window.scene = scene
scene.frame_start = 1
scene.frame_end = 181
scene.render.fps = 30


def linear_color(hex_color):
    channels = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(v / 12.92 if v < 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in channels)


def material(name, color, roughness=0.62, metallic=0.0, glow=0.0):
    mat = bpy.data.materials.new('Atelier_' + name)
    mat.use_nodes = True
    rgba = (*linear_color(color), 1)
    mat.diffuse_color = rgba
    shader = next(node for node in mat.node_tree.nodes if node.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = rgba
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    if glow:
        shader.inputs['Emission Color'].default_value = rgba
        shader.inputs['Emission Strength'].default_value = glow
    return mat


ink = material('Ink', '#172e3a')
paper = material('Porcelain', '#fff4dc')
page = material('Page', '#fffbed')
blue = material('EnamelBlue', '#287bac', 0.38)
sky = material('Sky', '#9ed8dc')
red = material('Vermilion', '#e95336', 0.43)
yellow = material('Ochre', '#ffc44d', 0.43)
silver = material('Aluminum', '#acc9c9', 0.36, 0.35)
screen_mat = material('Screen', '#163849', glow=0.25)
screen_blue = material('CodeBlue', '#84d8e4', glow=0.65)
screen_yellow = material('CodeYellow', '#ffcf69', glow=0.65)
screen_white = material('CodeWhite', '#e8eee0', glow=0.65)
flame_gold = material('FlameGold', '#ffa637', glow=0.4)
flame_cream = material('FlameCore', '#ffedac', glow=0.7)


def group(name, location=(0, 0, 0), parent=None, rotation=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    scene.collection.objects.link(obj)
    obj.parent = parent
    obj.location = location
    obj.rotation_euler = rotation
    return obj


def mesh_object(name, vertices, faces, mat, parent, location=(0, 0, 0)):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    obj.parent = parent
    obj.location = location
    mesh.materials.append(mat)
    return obj


def soften(obj, radius=0.04, segments=3):
    bevel = obj.modifiers.new('Machined edge', 'BEVEL')
    bevel.width = radius
    bevel.segments = segments
    bevel.limit_method = 'ANGLE'
    bevel.harden_normals = True
    normal = obj.modifiers.new('Face normals', 'WEIGHTED_NORMAL')
    normal.keep_sharp = True
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def box(name, size, location, mat, parent, radius=0.025, rotation=(0, 0, 0)):
    x, y, z = [value / 2 for value in size]
    vertices = [(-x, -y, -z), (x, -y, -z), (x, y, -z), (-x, y, -z),
                (-x, -y, z), (x, -y, z), (x, y, z), (-x, y, z)]
    faces = [(0, 3, 2, 1), (0, 1, 5, 4), (1, 2, 6, 5),
             (2, 3, 7, 6), (3, 0, 4, 7), (4, 5, 6, 7)]
    obj = mesh_object(name, vertices, faces, mat, parent, location)
    obj.rotation_euler = rotation
    if radius:
        soften(obj, radius)
    return obj


def lathe(name, profile, location, mat, parent, segments=48):
    vertices = []
    for radius, height in profile:
        vertices.extend((radius * math.cos(i * math.tau / segments),
                         radius * math.sin(i * math.tau / segments), height)
                        for i in range(segments))
    faces = []
    for ring in range(len(profile) - 1):
        for i in range(segments):
            j = (i + 1) % segments
            faces.append((ring * segments + i, ring * segments + j,
                          (ring + 1) * segments + j, (ring + 1) * segments + i))
    faces.append(tuple(reversed(range(segments))))
    faces.append(tuple((len(profile) - 1) * segments + i for i in range(segments)))
    obj = mesh_object(name, vertices, faces, mat, parent, location)
    for polygon in obj.data.polygons[:-2]:
        polygon.use_smooth = True
    return obj


def cylinder(name, radius, depth, location, mat, parent, axis=(0, 0, 1)):
    b = min(radius * 0.12, depth * 0.15, 0.024)
    profile = [(radius - b, -depth / 2), (radius, -depth / 2 + b),
               (radius, depth / 2 - b), (radius - b, depth / 2)]
    obj = lathe(name, profile, location, mat, parent, 32)
    obj.rotation_euler = Vector(axis).to_track_quat('Z', 'Y').to_euler()
    return obj


def tube(name, points, radius, mat, parent, cyclic=False):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 12
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    spline = curve.splines.new('BEZIER')
    spline.bezier_points.add(len(points) - 1)
    for point, coordinate in zip(spline.bezier_points, points):
        point.co = coordinate
        point.handle_left_type = 'AUTO'
        point.handle_right_type = 'AUTO'
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    scene.collection.objects.link(obj)
    obj.parent = parent
    curve.materials.append(mat)
    return obj


def ring(name, radius, thickness, location, mat, parent, axis=(0, 0, 1)):
    obj = tube(name, [(radius * math.cos(i * math.tau / 16),
                      radius * math.sin(i * math.tau / 16), 0) for i in range(16)],
               thickness, mat, parent, True)
    obj.location = location
    obj.rotation_euler = Vector(axis).to_track_quat('Z', 'Y').to_euler()
    return obj


def text_mesh(name, body, size, location, mat, parent, rotation=(math.pi / 2, 0, 0)):
    curve = bpy.data.curves.new(name, 'FONT')
    curve.body = body
    curve.size = size
    curve.extrude = 0
    curve.resolution_u = 3
    obj = bpy.data.objects.new(name, curve)
    scene.collection.objects.link(obj)
    obj.parent = parent
    obj.location = location
    obj.rotation_euler = rotation
    curve.materials.append(mat)
    return obj


root = group('AtelierRoot')
work = group('WorkStation', (-0.57, 0.10, 0.53), root, (0, 0, math.radians(-9)))
writing = group('WritingDesk', (-1.40, -1.13, 0.46), root, (0, 0, math.radians(-12)))
launch = group('LaunchStation', (1.64, 0.18, 0.45), root)

# The raised enamel deck grounds the objects and the cable connecting them.
box('DeckInkEdge', (5.3, 3.70, 0.29), (0, 0, 0.20), ink, root, 0.18)
box('DeckBlueFascia', (5.23, 3.63, 0.27), (0, 0, 0.24), blue, root, 0.16)
box('DeckPorcelainTop', (5.24, 3.64, 0.12), (0, 0, 0.405), paper, root, 0.10)
for x in [-2.12, 2.12]:
    for y in [-1.40, 1.40]:
        cylinder('RubberFoot', 0.15, 0.16, (x, y, 0.02), ink, root)
for i in range(3):
    box('DeckVent', (0.27, 0.017, 0.036), (1.42 + i * 0.33, -1.822, 0.23), ink, root, 0.01)

# Laptop chassis, inset keyboard, ports, trackpad and independently hinged lid.
box('LaptopLowerChassis', (2.27, 1.60, 0.13), (0, 0, 0.09), ink, work, 0.065)
box('LaptopBlueChassis', (2.22, 1.56, 0.12), (0, 0, 0.125), blue, work, 0.058)
box('LaptopDeck', (2.14, 1.48, 0.033), (0, 0, 0.195), paper, work, 0.015)
box('KeyboardRecess', (1.90, 0.86, 0.022), (0, 0.13, 0.217), ink, work, 0.026)
for row in range(4):
    for col in range(11):
        key_mat = red if row == 0 and col == 0 else (blue if col == 10 else paper)
        box('Keycap', (0.139, 0.143, 0.055), (-0.818 + col * 0.164, 0.438 - row * 0.178, 0.25), key_mat, work, 0.018)
box('Spacebar', (0.79, 0.115, 0.045), (-0.06, -0.28, 0.25), yellow, work, 0.018)
for x in [-0.84, -0.64, 0.61, 0.82]:
    box('ModifierKey', (0.15, 0.115, 0.045), (x, -0.28, 0.25), paper, work, 0.018)
box('TrackpadRim', (0.75, 0.29, 0.016), (0, -0.548, 0.218), silver, work, 0.05)
box('Trackpad', (0.70, 0.245, 0.018), (0, -0.548, 0.23), paper, work, 0.045)
for y in [-0.40, -0.11, 0.20]:
    box('USBPort', (0.010, 0.17, 0.033), (1.114, y, 0.13), ink, work, 0.005)
for x in [-0.83, 0.83]:
    cylinder('ScreenHinge', 0.063, 0.31, (x, 0.66, 0.22), ink, work, (1, 0, 0))
    cylinder('HingeEndcap', 0.038, 0.318, (x, 0.66, 0.22), yellow, work, (1, 0, 0))

lid = group('WorkScreenPivot', (0, 0.66, 0.24), work, (math.radians(-13), 0, 0))
box('LidInkPerimeter', (2.24, 0.12, 1.50), (0, 0, 0.77), ink, lid, 0.06)
box('LidBlueShell', (2.18, 0.10, 1.44), (0, 0.032, 0.77), blue, lid, 0.045)
box('ScreenGlass', (1.987, 0.012, 1.239), (0, -0.066, 0.79), screen_mat, lid, 0.018)
box('EditorTopbar', (1.98, 0.014, 0.14), (0, -0.076, 1.34), ink, lid, 0.012)
for x, mat in [(-0.88, red), (-0.775, yellow), (-0.67, sky)]:
    cylinder('EditorDot', 0.022, 0.008, (x, -0.087, 1.34), mat, lid, (0, -1, 0))
text_mesh('EditorFilename', 'hello.ts', 0.080, (-0.48, -0.087, 1.315), screen_white, lid)
for i in range(6):
    text_mesh('LineNumber', str(i + 1), 0.074, (-0.91, -0.079, 1.105 - i * 0.151), silver, lid)
text_mesh('CodeImport', 'const work = {', 0.111, (-0.72, -0.081, 1.10), screen_blue, lid)
text_mesh('CodeValue', "  craft: 'software',", 0.111, (-0.72, -0.081, 0.95), screen_yellow, lid)
text_mesh('CodeBuild', '  build: withCare', 0.111, (-0.72, -0.081, 0.80), screen_white, lid)
text_mesh('CodeClose', '}', 0.111, (-0.72, -0.081, 0.65), screen_blue, lid)
text_mesh('CodeRun', 'ship(work)', 0.111, (-0.72, -0.081, 0.35), screen_yellow, lid)
cursor = box('CodeCursor', (0.065, 0.012, 0.011), (-0.075, -0.086, 0.33), screen_white, lid, 0)
cylinder('Webcam', 0.015, 0.013, (0, -0.066, 1.46), silver, lid, (0, -1, 0))

# Editorial objects sit in front of the machine, with an actual bound page block.
box('NotebookBottomCover', (1.34, 0.89, 0.038), (0, 0, 0.02), ink, writing, 0.032)
box('NotebookBlueCover', (1.33, 0.88, 0.04), (0, 0, 0.041), blue, writing, 0.028)
box('NotebookPageBlock', (1.25, 0.80, 0.10), (0.02, 0, 0.11), page, writing, 0.016)
for height in [0.075, 0.092, 0.11, 0.127]:
    box('PageEdge', (1.21, 0.003, 0.002), (0.02, -0.402, height), silver, writing, 0)
book_page = group('WritingPagePivot', (-0.61, 0, 0.172), writing)
vertices = []
for x in range(13):
    u = x / 12
    for y in [-0.393, 0.393]:
        vertices.append((u * 1.24, y, math.sin(u * math.pi) * 0.045))
faces = [(i * 2, (i + 1) * 2, (i + 1) * 2 + 1, i * 2 + 1) for i in range(12)]
mesh_object('NotebookTopPage', vertices, faces, page, book_page)
for i, width in enumerate([0.77, 0.92, 0.72, 0.87]):
    box('NotebookRule', (width, 0.012, 0.003), (0.61, 0.16 - i * 0.105, 0.048), silver, book_page, 0)
box('NotebookHeading', (0.34, 0.045, 0.003), (0.40, 0.29, 0.043), ink, book_page, 0)
for y in [-0.31, -0.16, -0.01, 0.14, 0.29]:
    ring('WireBinding', 0.059, 0.011, (-0.62, y, 0.143), ink, writing, (0, 1, 0))
box('RibbonBookmark', (0.085, 0.26, 0.012), (0.44, -0.49, 0.078), red, writing, 0.004)
pen = group('WritingPen', (0.78, -0.10, 0.09), writing, (0, 0, math.radians(-14)))
cylinder('PenBarrel', 0.035, 0.91, (0, 0, 0), red, pen, (0, 1, 0))
cylinder('PenClipBand', 0.039, 0.035, (0, 0.31, 0), ink, pen, (0, 1, 0))
cylinder('PenCap', 0.039, 0.16, (0, 0.43, 0), yellow, pen, (0, 1, 0))
tip = lathe('PenNib', [(0.003, 0), (0.034, 0.12)], (0, -0.56, 0), ink, pen, 24)
tip.rotation_euler.x = -math.pi / 2

# The delivery rocket uses a continuous curved profile, swept fins and a glazed port.
cylinder('LaunchPadFoot', 0.78, 0.075, (0, 0, 0.04), ink, launch)
cylinder('LaunchPadDeck', 0.73, 0.065, (0, 0, 0.10), blue, launch)
ring('LaunchPadOuterMark', 0.60, 0.014, (0, 0, 0.14), paper, launch)
ring('LaunchPadInnerMark', 0.35, 0.012, (0, 0, 0.14), paper, launch)
for angle in [0, 120, 240]:
    a = math.radians(angle)
    box('PadAlignment', (0.16, 0.06, 0.012), (0.66 * math.cos(a), 0.66 * math.sin(a), 0.15), yellow, launch, 0.006, (0, 0, a))

rocket_rig = group('ContactRocketRig', (0, 0, 0.53), launch, (0, math.radians(-5), math.radians(4)))
rocket = group('RocketIdle', parent=rocket_rig)
body_profile = [(0.235, 0.18), (0.29, 0.22), (0.365, 0.35), (0.422, 0.53),
                (0.458, 0.76), (0.472, 1.00), (0.458, 1.25), (0.418, 1.46), (0.374, 1.61)]
lathe('RocketPorcelainBody', body_profile, (0, 0, 0), paper, rocket, 64)
lathe('RocketNoseSeam', [(0.377, 1.60), (0.369, 1.627)], (0, 0, 0), ink, rocket, 64)
lathe('RocketVermilionNose', [(0.369, 1.625), (0.327, 1.75), (0.265, 1.89),
                           (0.185, 2.035), (0.094, 2.164), (0.012, 2.25), (0.001, 2.256)],
      (0, 0, 0), red, rocket, 64)
lathe('RocketEngineCollar', [(0.245, 0.19), (0.268, 0.21), (0.296, 0.25), (0.304, 0.28)], (0, 0, 0), ink, rocket)
lathe('RocketEngineBell', [(0.20, 0.005), (0.214, 0.026), (0.173, 0.10), (0.142, 0.21)], (0, 0, 0), silver, rocket)
ring('NozzleRim', 0.202, 0.018, (0, 0, 0.012), ink, rocket)
ring('BodyPanelSeam', 0.426, 0.008, (0, 0, 0.55), ink, rocket)
for angle in [-90, 30, 150]:
    fin_points = [(0.33, 0.05, 0.66), (0.51, 0.05, 0.55), (0.72, 0.05, 0.04),
                  (0.70, 0.05, -0.10), (0.50, 0.05, 0.00), (0.28, 0.05, 0.23)]
    fin_points += [(x, -y, z) for x, y, z in fin_points]
    fin_faces = [tuple(reversed(range(6))), tuple(range(6, 12))]
    fin_faces += [(i, (i + 1) % 6, (i + 1) % 6 + 6, i + 6) for i in range(6)]
    fin = mesh_object('SweptRocketFin', fin_points, fin_faces, red, rocket)
    fin.rotation_euler.z = math.radians(angle)
    soften(fin, 0.035, 3)
port_axis = Vector((0.28, -0.96, 0))
port_center = Vector((0.132, -0.450, 1.15))
cylinder('PortholeBlackGasket', 0.241, 0.047, port_center, ink, rocket, port_axis)
cylinder('PortholeEnamelBezel', 0.222, 0.055, port_center + port_axis * 0.032, yellow, rocket, port_axis)
cylinder('PortholeInnerGasket', 0.178, 0.058, port_center + port_axis * 0.049, ink, rocket, port_axis)
lens = lathe('PortholeGlass', [(0, -0.01), (0.155, 0), (0.155, 0.01), (0.13, 0.044), (0.085, 0.066), (0.002, 0.078)], port_center + port_axis * 0.08, blue, rocket)
lens.rotation_euler = port_axis.to_track_quat('Z', 'Y').to_euler()
for angle in [45, 135, 225, 315]:
    a = math.radians(angle)
    lateral = Vector((0.96, 0.28, 0)) * (math.cos(a) * 0.200)
    position = port_center + lateral + Vector((0, 0, math.sin(a) * 0.200)) + port_axis * 0.064
    cylinder('PortholeBolt', 0.016, 0.013, position, ink, rocket, port_axis)
highlight = tube('WindowReflection', [(-0.045, -0.07, 0), (-0.085, -0.02, 0.017), (-0.08, 0.047, 0.025)], 0.013, screen_blue, rocket)
highlight.location = port_center + port_axis * 0.153
highlight.rotation_euler = port_axis.to_track_quat('Z', 'Y').to_euler()
flame = group('EngineFlame', (0, 0, -0.03), rocket)
lathe('OuterFlame', [(0.007, -0.45), (0.085, -0.30), (0.143, -0.14), (0.13, 0)], (0, 0, 0), flame_gold, flame)
lathe('InnerFlame', [(0.005, -0.32), (0.055, -0.18), (0.085, -0.04), (0.076, 0.006)], (0, -0.066, 0), flame_cream, flame)

# Articulated desk lamp, with separate pivots and an open reflector.
lamp = group('DeskLamp', (-1.91, 0.91, 0.47), root)
cylinder('LampRubberBase', 0.32, 0.065, (0, 0, 0.033), ink, lamp)
cylinder('LampEnamelBase', 0.29, 0.084, (0, 0, 0.09), yellow, lamp)
for y in [-0.055, 0.055]:
    tube('LampLowerArm', [(0, y, 0.13), (-0.20, y, 0.75)], 0.033, ink, lamp)
    tube('LampUpperArm', [(-0.20, y, 0.75), (0.18, y, 1.23)], 0.028, ink, lamp)
for x, z in [(0, 0.17), (-0.20, 0.75), (0.18, 1.23)]:
    cylinder('LampPivot', 0.086, 0.18, (x, 0, z), yellow, lamp, (0, 1, 0))
    cylinder('LampPivotScrew', 0.026, 0.19, (x, 0, z), ink, lamp, (0, 1, 0))
shade = group('LampShade', (0.29, -0.06, 1.28), lamp, (math.radians(-18), math.radians(-24), 0))
lathe('LampShadeEnamel', [(0.255, -0.24), (0.262, -0.22), (0.245, -0.18), (0.173, 0.055), (0.094, 0.115), (0.05, 0.13)], (0, 0, 0), yellow, shade)
cylinder('LampReflector', 0.228, 0.016, (0, 0, -0.242), page, shade)
ring('LampShadeInkRim', 0.247, 0.016, (0, 0, -0.238), ink, shade)
cylinder('LampBulb', 0.069, 0.028, (0, 0, -0.26), flame_cream, shade)
tube('LampWire', [(-0.02, 0.06, 0.19), (-0.24, 0.09, 0.60), (-0.25, 0.09, 0.78), (0.10, 0.09, 1.19)], 0.013, red, lamp)

# A deliberately routed cable connects the machine and delivery pad.
tube('DeliveryCable', [(0.62, -0.12, 0.51), (0.81, -0.37, 0.49), (0.73, -0.93, 0.495),
                       (1.15, -1.19, 0.495), (1.81, -1.13, 0.495), (1.91, -0.72, 0.50)], 0.028, ink, root)
box('CableConnector', (0.11, 0.21, 0.084), (1.91, -0.64, 0.50), red, root, 0.024)

# Small field notebook and reference cards complete the coding-adventure setting.
cards = group('ReferenceCards', (-0.27, 1.25, 0.49), root, (0, 0, math.radians(6)))
for i, mat in enumerate([red, yellow, paper]):
    box('ReferenceCard', (0.91, 0.50, 0.024), (i * 0.026, i * 0.023, i * 0.04), mat, cards, 0.018, (0, 0, math.radians(i * 4)))
text_mesh('ReferenceMark', '</>', 0.14, (-0.20, -0.02, 0.097), ink, cards, (0, 0, 0))

# Seamless six-second animation. Interaction poses are controlled by the browser.
for frame in [1, 31, 61, 91, 121, 151, 181]:
    phase = (frame - 1) / 180 * math.tau
    rocket.location.z = math.sin(phase) * 0.085
    rocket.rotation_euler.y = math.sin(phase) * math.radians(2)
    rocket.keyframe_insert('location', frame=frame)
    rocket.keyframe_insert('rotation_euler', frame=frame)
    flame.scale = (1 + math.sin(phase * 2) * 0.07, 1 + math.sin(phase * 2) * 0.07, 1 + math.cos(phase * 2) * 0.18)
    flame.keyframe_insert('scale', frame=frame)
for frame, width in [(1, 1), (21, 1), (23, 0.02), (42, 0.02), (44, 1), (66, 1),
                     (68, 0.02), (88, 0.02), (90, 1), (111, 1), (113, 0.02),
                     (134, 0.02), (136, 1), (156, 1), (158, 0.02), (179, 0.02), (181, 1)]:
    cursor.scale.x = width
    cursor.keyframe_insert('scale', frame=frame)
for obj in [rocket, flame, cursor]:
    action = obj.animation_data.action
    action.name = obj.name + '_Idle'
    track = obj.animation_data.nla_tracks.new()
    track.name = 'AtelierIdle'
    strip = track.strips.new(action.name, 1, action)
    obj.animation_data.action = None

# Convert text and tubes for portable geometry; merge static meshes per material
# within each moving parent so the authored detail does not require hundreds of draws.
for obj in list(scene.objects):
    if obj.type in ['CURVE', 'FONT']:
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.convert(target='MESH')
for obj in list(scene.objects):
    if obj.type == 'MESH' and obj.modifiers:
        bpy.context.view_layer.objects.active = obj
        for modifier in list(obj.modifiers):
            bpy.ops.object.modifier_apply(modifier=modifier.name)
batches = {}
for obj in list(scene.objects):
    if obj.type == 'MESH' and not obj.animation_data:
        key = (obj.parent.name if obj.parent else '', obj.data.materials[0].name)
        batches.setdefault(key, []).append(obj)
for (parent_name, material_name), objects in batches.items():
    if len(objects) < 2:
        continue
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    objects[0].name = parent_name + '_' + material_name

scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT')
for obj in scene.objects:
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=output_directory + '/public/models/portfolio-atelier.glb',
                          export_format='GLB', use_selection=True, export_apply=True,
                          export_animations=True, export_animation_mode='NLA_TRACKS',
                          export_frame_range=True, export_yup=True)

# Authoring camera uses the same orthographic composition as the web canvas.
camera_data = bpy.data.cameras.new('AtelierCamera')
camera_data.type = 'ORTHO'
camera_data.ortho_scale = 7.25
camera = bpy.data.objects.new('AtelierCamera', camera_data)
scene.collection.objects.link(camera)
camera.location = (6.7, -9.3, 7.0)
camera.rotation_euler = (Vector((0, 0, 1.03)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
scene.camera = camera

def area_light(name, location, energy, size, color):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = energy
    data.shape = 'DISK'
    data.size = size
    data.color = linear_color(color)
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector((0, 0, 0.8)) - obj.location).to_track_quat('-Z', 'Y').to_euler()

area_light('AtelierKey', (-3.5, -4.5, 7.5), 950, 5, '#fff0d2')
area_light('AtelierFill', (4, -1, 5), 500, 4, '#c7ebff')
area_light('AtelierRim', (0, 4.5, 6), 800, 3, '#ffffff')
world = bpy.data.worlds.new('AtelierWorld')
world.use_nodes = True
world_shader = next(node for node in world.node_tree.nodes if node.type == 'BACKGROUND')
world_shader.inputs['Color'].default_value = (*linear_color('#c1dde0'), 1)
world_shader.inputs['Strength'].default_value = 0.45
scene.world = world
scene.render.engine = 'CYCLES'
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = 1400
scene.render.resolution_y = 1050
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = output_directory + '/.impeccable/previews/portfolio-atelier.png'
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        area.spaces.active.region_3d.view_perspective = 'CAMERA'
        area.spaces.active.shading.type = 'MATERIAL'
bpy.ops.wm.save_as_mainfile(filepath=output_directory + '/assets/blender/portfolio-atelier.blend')
print('Portfolio atelier exported. Meshes:', len([o for o in scene.objects if o.type == 'MESH']))
