import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { muscles } from '../data/muscles';
import { useStore } from '../store/useStore';
import { Muscle } from '../types';

// Path to the GLB model file - place your model here
const MODEL_PATH = '/models/human-muscles.glb';

// Preload for performance
useGLTF.preload(MODEL_PATH);

// Colors for highlight levels
const COLORS: Record<string, THREE.Color> = {
  primary: new THREE.Color('#E53E3E'),
  secondary: new THREE.Color('#ED8936'),
  stabilizer: new THREE.Color('#F6AD55'),
  default: new THREE.Color('#C4956A'),
  inactive: new THREE.Color('#D4A574'),
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
  'MUSCLE_ABS': 'rectus-abdominis',
  'MUSCLE_BICEPS': 'biceps',
  'MUSCLE_CALF_1': 'calves',
  'MUSCLE_CALF_2': 'calves',
  'MUSCLE_DELTS': 'deltoid-middle',
  'MUSCLE_FOREARMS': 'forearms',
  'MUSCLE_GLUTE_1': 'glutes',
  'MUSCLE_GLUTE_2': 'glutes',
  'MUSCLE_HAM_1': 'hamstrings',
  'MUSCLE_HAM_2': 'hamstrings',
  'MUSCLE_LAT_1': 'latissimus-dorsi',
  'MUSCLE_LAT_2': 'latissimus-dorsi',
  'MUSCLE_PECS': 'pectoralis-major',
  'MUSCLE_QUAD_1': 'quadriceps',
  'MUSCLE_QUAD_2': 'quadriceps',
  'MUSCLE_TRAP_1': 'trapezius',
  'MUSCLE_TRAP_2': 'trapezius',
  'MUSCLE_TRICEPS': 'triceps',
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
    'latissimus': 'latissimus-dorsi',
    'trapezius': 'trapezius',
    'erector': 'erector-spinae',
    'deltoid': 'deltoid-middle',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'forearm': 'forearms',
    'abdominis': 'rectus-abdominis',
    'oblique': 'obliques',
    'quadriceps': 'quadriceps',
    'hamstring': 'hamstrings',
    'gluteus': 'glutes',
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

// Fallback procedural model when no GLB is available
function ProceduralModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { viewMode } = useStore();

  useFrame(() => {
    if (groupRef.current) {
      const targetRotation = viewMode === 'back' ? Math.PI : 0;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.05
      );
    }
  });

  const skinColor = '#D4A574';
  const skinMat = <meshStandardMaterial color={skinColor} roughness={0.7} metalness={0.05} />;

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        {skinMat}
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.15, 16]} />
        {skinMat}
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.28, 0.24, 0.35, 24]} />
        {skinMat}
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.24, 0.2, 0.35, 24]} />
        {skinMat}
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.18, 0.35, 24]} />
        {skinMat}
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.22, 0.2, 0.25, 24]} />
        {skinMat}
      </mesh>

      {/* Shoulders */}
      <mesh position={[-0.32, 1.35, 0]} rotation={[0, 0, 0.4]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        {skinMat}
      </mesh>
      <mesh position={[0.32, 1.35, 0]} rotation={[0, 0, -0.4]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        {skinMat}
      </mesh>

      {/* Arms */}
      <mesh position={[-0.38, 1.1, 0]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.07, 0.06, 0.35, 16]} />
        {skinMat}
      </mesh>
      <mesh position={[-0.42, 0.92, 0]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        {skinMat}
      </mesh>
      <mesh position={[-0.46, 0.72, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.05, 0.04, 0.35, 16]} />
        {skinMat}
      </mesh>
      <mesh position={[-0.48, 0.52, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        {skinMat}
      </mesh>

      <mesh position={[0.38, 1.1, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.07, 0.06, 0.35, 16]} />
        {skinMat}
      </mesh>
      <mesh position={[0.42, 0.92, 0]} rotation={[0, 0, -0.2]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        {skinMat}
      </mesh>
      <mesh position={[0.46, 0.72, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.05, 0.04, 0.35, 16]} />
        {skinMat}
      </mesh>
      <mesh position={[0.48, 0.52, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        {skinMat}
      </mesh>

      {/* Legs */}
      <mesh position={[-0.12, -0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.5, 20]} />
        {skinMat}
      </mesh>
      <mesh position={[-0.12, -0.38, 0]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        {skinMat}
      </mesh>
      <mesh position={[-0.12, -0.68, 0]}>
        <cylinderGeometry args={[0.065, 0.05, 0.5, 20]} />
        {skinMat}
      </mesh>
      <mesh position={[-0.12, -0.98, 0.04]}>
        <boxGeometry args={[0.08, 0.06, 0.14]} />
        {skinMat}
      </mesh>

      <mesh position={[0.12, -0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.5, 20]} />
        {skinMat}
      </mesh>
      <mesh position={[0.12, -0.38, 0]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        {skinMat}
      </mesh>
      <mesh position={[0.12, -0.68, 0]}>
        <cylinderGeometry args={[0.065, 0.05, 0.5, 20]} />
        {skinMat}
      </mesh>
      <mesh position={[0.12, -0.98, 0.04]}>
        <boxGeometry args={[0.08, 0.06, 0.14]} />
        {skinMat}
      </mesh>
    </group>
  );
}

interface MuscleState {
  targetColor: THREE.Color;
  currentColor: THREE.Color;
  targetEmissiveIntensity: number;
  currentEmissiveIntensity: number;
}

function LoadedModel({ gltf }: { gltf: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewMode, highlights, setSelectedMuscle, selectedMuscle } = useStore();
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const muscleMeshMapRef = useRef<Map<string, THREE.Mesh[]>>(new Map());
  const muscleStateRef = useRef<Map<string, MuscleState>>(new Map());
  const initializedRef = useRef(false);

  const { scene } = gltf;

  // Initialize muscle mesh map once
  if (!initializedRef.current) {
    const map = new Map<string, THREE.Mesh[]>();
    
    scene.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh) {
        const muscle = findMuscleForNode(node.name);
        if (muscle) {
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
        }
      }
    });

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

  // Animate color transitions and handle hover/selection
  useFrame((_, delta) => {
    const time = Date.now() * 0.001;
    
    // Rotate model based on view mode
    if (groupRef.current) {
      const targetRotation = viewMode === 'back' ? Math.PI : 0;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.05
      );
    }

    // Animate each muscle
    muscleMeshMap.forEach((meshes, muscleId) => {
      const state = muscleStateRef.current.get(muscleId);
      if (!state) return;
      
      const isSelected = selectedMuscle?.id === muscleId;
      const isHovered = hoveredMuscle === muscleId;
      const highlight = highlights.find(h => h.muscleId === muscleId);
      
      // Determine effective target color (hover/selection takes priority)
      let effectiveTargetColor = state.targetColor;
      let effectiveTargetIntensity = state.targetEmissiveIntensity;
      
      if (isHovered || isSelected) {
        effectiveTargetColor = state.targetColor.clone();
        effectiveTargetIntensity = 0.3;
      }
      
      // Pulse effect for primary muscles
      if (highlight?.level === 'primary' && !isHovered && !isSelected) {
        const pulse = Math.sin(time * 3) * 0.1 + 0.3;
        effectiveTargetIntensity = pulse;
      }

      // Smooth color transition
      state.currentColor.lerp(effectiveTargetColor, delta * 5);
      state.currentEmissiveIntensity += (effectiveTargetIntensity - state.currentEmissiveIntensity) * delta * 5;

      // Apply to all meshes for this muscle
      meshes.forEach(mesh => {
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (!material) return;
        
        material.color.copy(state.currentColor);
        material.emissiveIntensity = state.currentEmissiveIntensity;
        material.emissive.copy(state.currentEmissiveIntensity > 0 ? state.currentColor : new THREE.Color('#000000'));
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

export function HumanModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { viewMode } = useStore();

  // Try to load the GLB model
  let gltf = null;
  try {
    gltf = useGLTF(MODEL_PATH);
  } catch (e) {
    // Model not found, will use procedural fallback
  }

  // Rotate model based on view mode (for procedural model)
  useFrame(() => {
    if (groupRef.current) {
      const targetRotation = viewMode === 'back' ? Math.PI : 0;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.05
      );
    }
  });

  // If no model loaded, use procedural fallback
  if (!gltf) {
    return <ProceduralModel />;
  }

  return <LoadedModel gltf={gltf} />;
}
