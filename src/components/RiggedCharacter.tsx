import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { exercises } from '../data/exercises';
import { getExerciseMotion } from '../data/exerciseMotions';
import { getRepRhythm, SMOOTH_FAST } from '../utils/repRhythm';
import { STANDING_POSE, getExercisePose, ExercisePose, BoneDelta } from '../data/bonePoses';

// Path to the rigged character (Mixamo-style skeleton)
const XBOT_PATH = '/models/xbot.glb';

// The skinned mesh renders ~1.55 units tall at scale 1. Calibrated via WebGL
// pixel measurement: scale 2.0 + offset 0.3 centers the character at ~80% of
// the viewport height (canvas 1536x930, camera z=5). Bone local 1 unit =
// 0.01 world units (root scale 0.01) — pose `hipsY` values are local units.
const SCALE = 2.0;
const OFFSET_Y = 0.3;

useGLTF.preload(XBOT_PATH);

export function RiggedCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const { viewMode, selectedExercises, setPreviewHint } = useStore();

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

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    const profile = getExercisePose(selectedExercises[0]);
    // Reuse the muscle model's per-exercise speed so both modes move in sync
    const speed = getExerciseMotion(selectedExercises[0]).speed;
    const { active, repT, wave, rhythm, swingWave } = getRepRhythm(time, speed);
    // swing poses oscillate -1..1, normal poses 0..1
    const amp = profile.swing ? swingWave : rhythm;

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
      current.slerp(targetQuat.current, delta * SMOOTH_FAST);
      bone.quaternion.copy(current);
    });

    // Hips vertical offset
    const targetHipsY = (pose.hipsY || 0) * amp;
    currentHipsYRef.current += (targetHipsY - currentHipsYRef.current) * delta * SMOOTH_FAST;
    if (hipsRef.current) {
      hipsRef.current.position.y = currentHipsYRef.current;
    }
  });

  // Click feedback: the character has no muscle breakdown, so show a hint
  // about the currently previewed exercise instead of opening a muscle panel.
  const handleClick = () => {
    const name = exercises.find(ex => ex.id === selectedExercises[0])?.name;
    setPreviewHint(
      name
        ? `🎬 ${name} 动作演示中 — 切换左侧动作可更换姿势`
        : '💡 请先在左侧选择一个训练动作'
    );
  };

  return (
    <group ref={groupRef} scale={SCALE} position={[0, OFFSET_Y, 0]}>
      <primitive object={scene} onClick={handleClick} />
    </group>
  );
}
