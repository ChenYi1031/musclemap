// Diagnose: does wrapping a SkinnedMesh in a scaled group affect its rendered size?
const fs = require('fs');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');

const buffer = fs.readFileSync('public/models/xbot.glb');
const loader = new GLTFLoader();

function skinVertex(mesh, v) {
  // Replicate GPU skinning on CPU: skinned = Σ weight * (bone.matrixWorld * bindInverse) * v
  const pos = mesh.geometry.attributes.position;
  const skinIndex = mesh.geometry.attributes.skinIndex;
  const skinWeight = mesh.geometry.attributes.skinWeight;
  const result = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const m = new THREE.Matrix4();
  for (let i = 0; i < 4; i++) {
    const boneIndex = skinIndex.getX(v);
    const weight = skinWeight.getX(v);
    if (weight === 0) break;
    const bone = mesh.skeleton.bones[boneIndex];
    // bone world matrix (includes all ancestor transforms)
    m.copy(bone.matrixWorld).multiply(mesh.bindMatrixInverse);
    tmp.set(pos.getX(v), pos.getY(v), pos.getZ(v)).applyMatrix4(m).multiplyScalar(weight);
    result.add(tmp);
  }
  return result;
}

loader.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), '', (gltf) => {
  let skin = null;
  gltf.scene.traverse(n => { if (n.isSkinnedMesh && !skin) skin = n; });

  // Scene root scale
  console.log('gltf.scene.scale:', gltf.scene.scale.toArray().map(x => x.toFixed(4)));
  console.log('gltf.scene.position:', gltf.scene.position.toArray().map(x => x.toFixed(4)));

  function measure(label) {
    skin.updateMatrixWorld(true);
    skin.skeleton.update();
    // find a vertex with max Y (head top) and min Y (foot)
    const pos = skin.geometry.attributes.position;
    let maxY = -Infinity, minY = Infinity;
    for (let i = 0; i < pos.count; i += 97) {
      const p = skinVertex(skin, i);
      if (p.y > maxY) maxY = p.y;
      if (p.y < minY) minY = p.y;
    }
    console.log(label.padEnd(30), 'renderedHeight:', (maxY - minY).toFixed(3), 'minY:', minY.toFixed(3), 'maxY:', maxY.toFixed(3));
  }

  measure('RAW (no wrapper)');

  // Wrap in group scale 6, offset -5.5
  const group = new THREE.Group();
  group.scale.set(6, 6, 6);
  group.position.set(0, -5.5, 0);
  gltf.scene.parent = null;
  group.add(gltf.scene);
  gltf.scene.updateWorldMatrix(true, true);
  measure('GROUP scale=6 offset=-5.5');

  // Directly scale the scene object
  gltf.scene.scale.set(6, 6, 6);
  gltf.scene.position.set(0, -5.5, 0);
  measure('SCENE.scale=6');
});
