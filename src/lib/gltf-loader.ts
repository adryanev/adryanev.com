import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'

// Models in public/models are compressed with EXT_meshopt_compression
export function createGltfLoader() {
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
}
