import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { STANDING_POSE, getExercisePose, ExercisePose, BoneDelta } from '../data/bonePoses';

// Path to the rigged character (Mixamo-style skeleton)
const XBOT_PATH = '/models/xbot.glb';

// Model renders ~1.55 units tall at scale 1 (skinned-mesh bound). 
// Calibrated via pixel measurement: scale 2.0 + offset 0.3 centers the
// character at ~80% of the viewport height (canvas 1536x930, camera z=5).
const SCALE = 2.0;
const OFFSET_Y = 0.3;

// Bone local 1 unit = 0.01 world units (root scale 0.01)
const POS_TO_WORLD = 0.01;

useGLTF.preload(XBOT_PATH);

export function RiggedCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const { viewMode, selectedExercises } = useStore();

  const gltf = useGLTF(XBOT_PATH);

  const boneMapRef = useRef<Map<string, THREE.Bone>>(new Map());
  const tposeQuatsRef = useRef<Map<string, THREE.Quaternion>>(new Map());
  const currentQuatsRef = useRef<Map<string, THREE.Quaternion>>(new Map());
  const hipsRef = useRef<THREE.Bone | null>(null);
  const currentHipsYRef = useRef(0);
  const initializedRef = useRef(false);

  // Initialize bone lookup + record T-pose bind quaternions
  if (!initializedRef.current) {
    const skinnedMeshes: THREE.SkinnedMesh[] = [];
    gltf.scene.traverse((node) => {
      if (node instanceof THREE.SkinnedMesh) skinnedMeshes.push(node);
    });
    const skinned = skinnedMeshes[0];
    if (skinned) {
      skinned.skeleton.bones.forEach((bone) => {
        boneMapRef.current.set(bone.name, bone);
        tposeQuatsRef.current.set(bone.name, bone.quaternion.clone());
        currentQuatsRef.current.set(bone.name, bone.quaternion.clone());
      });
      hipsRef.current = boneMapRef.current.get('mixamorigHips') || null;
    }
    initializedRef.current = true;
  }

  const { scene } = gltf;
  const tmpEuler = useRef(new THREE.Euler(0, 0, 0, 'XYZ'));
  const tmpQuat = useRef(new THREE.Quaternion());
  const targetQuat = useRef(new THREE.Quaternion());

  useFrame((_, delta) => {
    const time = Date.now() * 0.001;

    // Rep cycle with rest phase (same rhythm as the muscle model)
    const profile = getExercisePose(selectedExercises[0]);
    const cycle01 = ((time * 1.0 * 2.6) % (Math.PI * 2)) / (Math.PI * 2);
    const active = cycle01 < 0.55 ? 1 : 0;
    const repT = Math.min(cycle01 / 0.55, 1);
    const wave = Math.sin(repT * Math.PI);
    // swing poses oscillate -1..1, normal poses 0..1
    const amp = profile.swing ? Math.sin(repT * Math.PI * 2) : active * wave;

    // Determine the effective pose (standing rest when no exercise selected)
    const pose: ExercisePose = selectedExercises.length > 0
      ? { bones: { ...STANDING_POSE.bones, ...profile.bones }, hipsY: profile.hipsY, swing: profile.swing }
      : STANDING_POSE;

    // View rotation
    if (groupRef.current) {
      const targetRotation = viewMode === 'back' ? Math.PI : 0;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.05
      );
    }

    const bones = pose.bones;
    boneMapRef.current.forEach((bone, name) => {
      const current = currentQuatsRef.current.get(name);
      const tpose = tposeQuatsRef.current.get(name);
      if (!current || !tpose) return;

      const boneDelta: BoneDelta | undefined = bones[name];
      if (boneDelta) {
        tmpEuler.current.set(boneDelta.x || 0, boneDelta.y || 0, boneDelta.z || 0);
        // scale by amplitude
        tmpEuler.current.x *= amp;
        tmpEuler.current.y *= amp;
        tmpEuler.current.z *= amp;
        tmpQuat.current.setFromEuler(tmpEuler.current);
        targetQuat.current.copy(tpose).multiply(tmpQuat.current);
      } else {
        targetQuat.current.copy(tpose);
      }

      // Smooth transition toward the target
      current.slerp(targetQuat.current, delta * 5);
      bone.quaternion.copy(current);
    });

    // Hips vertical offset
    const targetHipsY = (pose.hipsY || 0) * amp;
    currentHipsYRef.current += (targetHipsY - currentHipsYRef.current) * delta * 5;
    if (hipsRef.current) {
      hipsRef.current.position.y = currentHipsYRef.current;
    }
  });

  return (
    <group ref={groupRef} scale={SCALE} position={[0, OFFSET_Y, 0]}>
      <primitive object={scene} />
    </group>
  );
}
