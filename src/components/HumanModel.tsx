import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { muscles } from '../data/muscles';
import { useStore } from '../store/useStore';
import { Muscle } from '../types';

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
