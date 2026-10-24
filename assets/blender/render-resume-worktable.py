"""Render the static fallback for the Resume worktable.

Run: blender -b assets/blender/resume-worktable.blend --python assets/blender/render-resume-worktable.py
"""

from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1400
scene.render.resolution_y = 750
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.quality = 82
scene.render.filepath = str(ROOT / 'public/models/resume-worktable-poster.webp')
scene.render.film_transparent = False

world = bpy.data.worlds.new('Worktable backdrop')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.02, 0.06, 0.075, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.7
scene.world = world

camera_data = bpy.data.cameras.new('Resume fallback camera')
camera = bpy.data.objects.new('Resume fallback camera', camera_data)
bpy.context.collection.objects.link(camera)
camera.location = (0, -13.5, 5.2)
target = Vector((0, 0, 0.65))
camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera_data.lens = 46
scene.camera = camera

for name, location, power, size in [
    ('Key', (-4, -5, 8), 1300, 7),
    ('Fill', (4, -1, 6), 850, 6),
]:
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = power
    data.shape = 'DISK'
    data.size = size
    light = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(light)
    light.location = location
    light.rotation_euler = (target - light.location).to_track_quat('-Z', 'Y').to_euler()

scene.view_settings.view_transform = 'Standard'
bpy.ops.render.render(write_still=True)
print('Rendered', scene.render.filepath)
