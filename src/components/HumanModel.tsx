import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { muscles } from '../data/muscles';
import { getExerciseMotion } from '../data/exerciseMotions';
import { useStore } from '../store/useStore';
import { Muscle, HighlightLevel } from '../types';

// Path to the GLB model file
const MODEL_PATH = '/models/human-muscles.glb';

// Colors for highlight levels
const COLORS: Record<string, THREE.Color> = {
  primary: new THREE.Color('#E53E3E'),
  secondary: new THREE.Color('#ED8936'),
  stabilizer: new THREE.Color('#F6AD55'),
  default: new THREE.Color('#C4956A'),
};

// Create a lookup map: meshId -> muscle
const muscleByMeshId = new Map<string, Muscle>();
muscles.forEach(muscle => {
  muscleByMeshId.set(muscle.meshId, muscle);
  // Also create reverse mappings for common naming patterns
  // e.g., "Pectoralis_Major_L" -> "pectoralis-major"
  const name = muscle.nameEn.toLowerCase().replace(/\s+/g, '_');
  muscleByMeshId.set(name, muscle);
});

// Mapping from 3DMuscleSelector model mesh names to our muscle IDs
// Model uses: MUSCLE_ABS, MUSCLE_BICEPS, MUSCLE_CALF_1/2, MUSCLE_DELTS,
// MUSCLE_FOREARMS, MUSCLE_GLUTE_1/2, MUSCLE_HAM_1/2, MUSCLE_LAT_1/2,
// MUSCLE_PECS, MUSCLE_QUAD_1/2, MUSCLE_TRAP_1/2, MUSCLE_TRICEPS
const MESH_NAME_TO_MUSCLE: Record<string, string> = {
  // Core
  'MUSCLE_ABS': 'rectus-abdominis',
  // Arm
  'MUSCLE_BICEPS': 'biceps',
  'MUSCLE_TRICEPS': 'triceps',
  'MUSCLE_FOREARMS': 'forearms',
  // Leg
  'MUSCLE_CALF_1': 'calves',
  'MUSCLE_CALF_2': 'calves',
  'MUSCLE_GLUTE_1': 'glutes',
  'MUSCLE_GLUTE_2': 'glutes',
  'MUSCLE_HAM_1': 'hamstrings',
  'MUSCLE_HAM_2': 'hamstrings',
  'MUSCLE_QUAD_1': 'quadriceps',
  'MUSCLE_QUAD_2': 'quadriceps',
  // Back
  'MUSCLE_LAT_1': 'latissimus-dorsi',
  'MUSCLE_LAT_2': 'latissimus-dorsi',
  'MUSCLE_TRAP_1': 'trapezius',
  'MUSCLE_TRAP_2': 'trapezius',
  // Chest
  'MUSCLE_PECS': 'pectoralis-major',
  // Shoulder
  'MUSCLE_DELTS': 'deltoid-middle',
};

// Helper to find muscle from node name
function findMuscleForNode(nodeName: string): Muscle | null {
  // Try exact match first
  const exact = muscleByMeshId.get(nodeName);
  if (exact) return exact;

  // Try the 3DMuscleSelector mapping
  const mappedId = MESH_NAME_TO_MUSCLE[nodeName];
  if (mappedId) {
    const muscle = muscles.find(m => m.id === mappedId);
    if (muscle) return muscle;
  }

  // Try case-insensitive match
  const lower = nodeName.toLowerCase();
  for (const [key, muscle] of muscleByMeshId.entries()) {
    if (key.toLowerCase() === lower) return muscle;
  }

  // Try partial match
  for (const [key, muscle] of muscleByMeshId.entries()) {
    const keyLower = key.toLowerCase();
    if (lower.includes(keyLower) || keyLower.includes(lower.replace(/_/g, ''))) {
      return muscle;
    }
  }

  // Try matching by common anatomy naming patterns (fallback)
  const muscleKeywords: Record<string, string> = {
    'pectoralis': 'pectoralis-major',
    'serratus': 'serratus-anterior',
    'latissimus': 'latissimus-dorsi',
    'trapezius': 'trapezius',
    'rhomboid': 'rhomboids',
    'erector': 'erector-spinae',
    'deltoid': 'deltoid-middle',
    'rotator': 'rotator-cuff',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'brachialis': 'brachialis',
    'forearm': 'forearms',
    'abdominis': 'rectus-abdominis',
    'oblique': 'obliques',
    'transverse': 'transverse-abdominis',
    'quadriceps': 'quadriceps',
    'hamstring': 'hamstrings',
    'gluteus maximus': 'glutes',
    'gluteus medius': 'glute-medius',
    'glute': 'glutes',
    'adductor': 'adductors',
    'hip flexor': 'hip-flexors',
    'calf': 'calves',
    'gastrocnemius': 'calves',
    'soleus': 'calves',
  };

  for (const [keyword, muscleId] of Object.entries(muscleKeywords)) {
    if (lower.includes(keyword)) {
      const muscle = muscles.find(m => m.id === muscleId);
      if (muscle) return muscle;
    }
  }

  return null;
}

interface MuscleState {
  targetColor: THREE.Color;
  currentColor: THREE.Color;
  targetEmissiveIntensity: number;
  currentEmissiveIntensity: number;
}

// Pump strength per highlight level (muscle flex magnitude)
const PUMP_STRENGTH: Record<HighlightLevel, number> = {
  primary: 0.16,
  secondary: 0.09,
  stabilizer: 0.05,
  none: 0,
};

interface FlexState {
  current: number; // 0..1 smoothed activation
  target: number;  // 0 or 1
  level: HighlightLevel;
}

function LoadedModel({ gltf }: { gltf: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewMode, highlights, setSelectedMuscle, selectedMuscle, selectedExercises } = useStore();
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const muscleMeshMapRef = useRef<Map<string, THREE.Mesh[]>>(new Map());
  const muscleStateRef = useRef<Map<string, MuscleState>>(new Map());
  const flexStateRef = useRef<Map<string, FlexState>>(new Map());
  const flexWrapperByMeshRef = useRef<Map<string, THREE.Group>>(new Map());
  const motionRef = useRef({ bob: 0, lean: 0, rock: 0, speed: 1 });
  const initializedRef = useRef(false);

  const { scene } = gltf;

  // Initialize muscle mesh map once
  if (!initializedRef.current) {
    const map = new Map<string, THREE.Mesh[]>();

    scene.updateMatrixWorld(true);

    // Phase 1: collect all meshes (do NOT mutate the graph while traversing)
    const meshNodes: THREE.Mesh[] = [];
    scene.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh) meshNodes.push(node);
    });

    // Phase 2: process each mesh
    for (const node of meshNodes) {
      const muscle = findMuscleForNode(node.name);
      if (!muscle) continue;

      // Create a completely new MeshStandardMaterial
      const newMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.default,
        roughness: 0.5,
        metalness: 0.1,
        emissive: new THREE.Color('#000000'),
        emissiveIntensity: 0,
      });

      // Replace the material completely
      node.material = newMaterial;

      // Wrap the mesh in a pivot group centered on its bounding box,
      // so we can "pump" the muscle without displacing it along the body
      node.geometry.computeBoundingBox();
      const bb = node.geometry.boundingBox?.clone();
      if (!bb) continue;
      const center = new THREE.Vector3();
      bb.getCenter(center).applyMatrix4(node.matrixWorld);
      const size = new THREE.Vector3();
      bb.getSize(size);

      // Never scale the longest axis (the limb axis) — thicken only the
      // two short axes so the muscle bulges in place instead of sliding.
      const pumpAxes = { x: 1, y: 1, z: 1 };
      if (size.x >= size.y && size.x >= size.z) pumpAxes.x = 0;
      else if (size.y >= size.x && size.y >= size.z) pumpAxes.y = 0;
      else pumpAxes.z = 0;

      const wrapper = new THREE.Group();
      wrapper.name = `flex_${node.name}`;
      wrapper.userData.pumpAxes = pumpAxes;
      wrapper.position.copy(center);
      scene.add(wrapper);
      wrapper.attach(node); // reparent preserving world transform

      flexWrapperByMeshRef.current.set(node.uuid, wrapper);

      const meshes = map.get(muscle.id) || [];
      meshes.push(node);
      map.set(muscle.id, meshes);

      // Initialize muscle state
      if (!muscleStateRef.current.has(muscle.id)) {
        muscleStateRef.current.set(muscle.id, {
          targetColor: COLORS.default.clone(),
          currentColor: COLORS.default.clone(),
          targetEmissiveIntensity: 0,
          currentEmissiveIntensity: 0,
        });
      }
      if (!flexStateRef.current.has(muscle.id)) {
        flexStateRef.current.set(muscle.id, { current: 0, target: 0, level: 'none' });
      }
    }

    muscleMeshMapRef.current = map;
    initializedRef.current = true;
  }

  const muscleMeshMap = muscleMeshMapRef.current;

  // Update target colors when highlights change
  useEffect(() => {
    // Reset all to default first
    muscleStateRef.current.forEach((state) => {
      state.targetColor = COLORS.default.clone();
      state.targetEmissiveIntensity = 0;
    });
    
    // Set targets based on highlights
    highlights.forEach((highlight) => {
      const state = muscleStateRef.current.get(highlight.muscleId);
      if (state && highlight.level !== 'none') {
        state.targetColor = COLORS[highlight.level].clone();
        if (highlight.level === 'primary') {
          state.targetEmissiveIntensity = 0.4;
        } else if (highlight.level === 'secondary') {
          state.targetEmissiveIntensity = 0.2;
        } else if (highlight.level === 'stabilizer') {
          state.targetEmissiveIntensity = 0.1;
        }
      }
    });
  }, [highlights]);

  // Animate color transitions, muscle pump, and exercise motion
  useFrame((_, delta) => {
    const time = Date.now() * 0.001;

    // Build a level lookup (primary > secondary > stabilizer already resolved upstream)
    const levelFor = new Map<string, HighlightLevel>();
    highlights.forEach((h) => {
      if (h.level !== 'none') levelFor.set(h.muscleId, h.level);
    });

    // Exercise motion profile (whole-body movement)
    const profile = getExerciseMotion(selectedExercises[0]);
    const motion = motionRef.current;
    motion.bob += (profile.bob - motion.bob) * delta * 3;
    motion.lean += (profile.lean - motion.lean) * delta * 3;
    motion.rock += (profile.rock - motion.rock) * delta * 3;
    motion.speed += (profile.speed - motion.speed) * delta * 3;

    // Rep cycle with a rest phase: the model moves for the first ~55% of the
    // cycle (concentric + eccentric), then fully rests. Prevents constant
    // shaking/jitter when nothing is selected or between reps.
    const cycle01 = ((time * motion.speed * 2.6) % (Math.PI * 2)) / (Math.PI * 2);
    const active = cycle01 < 0.55 ? 1 : 0;
    const repT = Math.min(cycle01 / 0.55, 1);      // 0..1 during the active phase
    const wave = Math.sin(repT * Math.PI);          // 0 -> 1 -> 0 (one rep)
    const rhythm = active * wave;                   // 0..1, 0 during rest

    if (groupRef.current) {
      // Rotate model based on view mode
      const targetRotation = viewMode === 'back' ? Math.PI : 0;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.05
      );
      // Exercise motion (rests fully between reps; idle is completely static)
      groupRef.current.position.y = -active * wave * motion.bob;
      groupRef.current.rotation.x = active * wave * motion.lean;
      groupRef.current.rotation.z = active * Math.sin(repT * Math.PI * 2) * motion.rock;
    }

    // Update flex activation targets from highlights
    flexStateRef.current.forEach((flex, muscleId) => {
      const level = levelFor.get(muscleId) ?? 'none';
      flex.level = level;
      flex.target = level === 'none' ? 0 : 1;
      flex.current += (flex.target - flex.current) * delta * 4;
    });

    // Animate each muscle
    muscleMeshMap.forEach((meshes, muscleId) => {
      const state = muscleStateRef.current.get(muscleId);
      if (!state) return;

      const isSelected = selectedMuscle?.id === muscleId;
      const isHovered = hoveredMuscle === muscleId;
      const highlight = levelFor.get(muscleId);

      // Determine effective target color (hover/selection takes priority)
      let effectiveTargetColor = state.targetColor;
      let effectiveTargetIntensity = state.targetEmissiveIntensity;

      if (isHovered || isSelected) {
        effectiveTargetColor = state.targetColor.clone();
        effectiveTargetIntensity = 0.3;
      }

      // Pulse effect for primary muscles — synced to the rep rhythm so the
      // glow contracts with the movement and rests between reps
      if (highlight === 'primary' && !isHovered && !isSelected) {
        effectiveTargetIntensity = 0.15 + 0.35 * rhythm;
      }

      // Smooth color transition
      state.currentColor.lerp(effectiveTargetColor, delta * 5);
      state.currentEmissiveIntensity += (effectiveTargetIntensity - state.currentEmissiveIntensity) * delta * 5;

      // Muscle pump (flex) — thickness pulses in rep rhythm, relaxes fully between reps
      const flex = flexStateRef.current.get(muscleId);
      const pumpAmount = flex
        ? flex.current * PUMP_STRENGTH[flex.level] * (0.2 + 0.8 * rhythm)
        : 0;

      // Apply to all meshes for this muscle
      meshes.forEach(mesh => {
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (!material) return;

        material.color.copy(state.currentColor);
        material.emissiveIntensity = state.currentEmissiveIntensity;
        material.emissive.copy(state.currentEmissiveIntensity > 0 ? state.currentColor : new THREE.Color('#000000'));

        // Scale the pivot wrapper (thicken the two short axes)
        const wrapper = flexWrapperByMeshRef.current.get(mesh.uuid);
        if (wrapper && pumpAmount > 0.001) {
          const { x, y, z } = wrapper.userData.pumpAxes;
          wrapper.scale.set(1 + pumpAmount * x, 1 + pumpAmount * y, 1 + pumpAmount * z);
        } else if (wrapper) {
          wrapper.scale.setScalar(1);
        }
      });
    });
  });

  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        onClick={(e: any) => {
          e.stopPropagation();
          // Find which muscle was clicked
          let obj = e.object;
          while (obj) {
            const muscle = findMuscleForNode(obj.name);
            if (muscle) {
              setSelectedMuscle(selectedMuscle?.id === muscle.id ? null : muscle);
              return;
            }
            obj = obj.parent;
          }
        }}
        onPointerOver={(e: any) => {
          e.stopPropagation();
          let obj = e.object;
          while (obj) {
            const muscle = findMuscleForNode(obj.name);
            if (muscle) {
              setHoveredMuscle(muscle.id);
              document.body.style.cursor = 'pointer';
              return;
            }
            obj = obj.parent;
          }
        }}
        onPointerOut={() => {
          setHoveredMuscle(null);
          document.body.style.cursor = 'auto';
        }}
      />
    </group>
  );
}

// Error boundary for GLB load failure
function GlbErrorFallback() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial color="#C4956A" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#C4956A" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function HumanModel() {
  // Load GLB model - hooks must be called unconditionally
  const gltf = useGLTF(MODEL_PATH);

  if (!gltf) {
    return <GlbErrorFallback />;
  }

  return <LoadedModel gltf={gltf} />;
}
