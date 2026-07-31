import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Muscle } from '../types';
import { useStore } from '../store/useStore';

interface MuscleMeshProps {
  muscle: Muscle;
}

const COLORS = {
  primary: new THREE.Color('#E53E3E'),
  secondary: new THREE.Color('#ED8936'),
  stabilizer: new THREE.Color('#F6AD55'),
  default: new THREE.Color('#C4956A'),
  inactive: new THREE.Color('#B8866B'),
  outline: new THREE.Color('#8B5E3C'),
};

interface MuscleGeometry {
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  shape: 'box' | 'sphere' | 'cylinder' | 'capsule';
  mirror?: boolean;
}

const muscleGeometry: Record<string, MuscleGeometry> = {
  // CHEST - Pectoralis Major (both sides)
  'pectoralis-major': { position: [-0.12, 1.25, 0.2], scale: [0.18, 0.12, 0.06], shape: 'box', mirror: true },

  // BACK
  'latissimus-dorsi': { position: [-0.15, 1.0, -0.18], scale: [0.15, 0.25, 0.05], shape: 'box', mirror: true },
  'trapezius': { position: [0, 1.4, -0.12], scale: [0.25, 0.18, 0.04], shape: 'box' },
  'erector-spinae': { position: [0, 0.7, -0.2], scale: [0.08, 0.4, 0.04], shape: 'cylinder' },

  // SHOULDERS - Deltoids (3 parts each side)
  'deltoid-front': { position: [-0.32, 1.35, 0.08], scale: [0.08, 0.1, 0.07], shape: 'sphere', mirror: true },
  'deltoid-middle': { position: [-0.36, 1.32, 0], scale: [0.07, 0.1, 0.08], shape: 'sphere', mirror: true },
  'deltoid-rear': { position: [-0.32, 1.35, -0.08], scale: [0.08, 0.1, 0.07], shape: 'sphere', mirror: true },

  // ARMS
  'biceps': { position: [-0.38, 1.12, 0.04], scale: [0.06, 0.12, 0.06], shape: 'capsule', mirror: true },
  'triceps': { position: [-0.38, 1.12, -0.04], scale: [0.055, 0.12, 0.055], shape: 'capsule', mirror: true },
  'forearms': { position: [-0.44, 0.78, 0], scale: [0.045, 0.18, 0.045], shape: 'cylinder', mirror: true },

  // CORE
  'rectus-abdominis': { position: [0, 0.9, 0.2], scale: [0.16, 0.22, 0.04], shape: 'box' },
  'obliques': { position: [-0.18, 0.85, 0.12], scale: [0.08, 0.18, 0.04], shape: 'box', mirror: true },

  // LEGS
  'quadriceps': { position: [-0.12, -0.05, 0.06], scale: [0.09, 0.22, 0.08], shape: 'cylinder', mirror: true },
  'hamstrings': { position: [-0.12, -0.05, -0.06], scale: [0.08, 0.22, 0.06], shape: 'cylinder', mirror: true },
  'glutes': { position: [-0.1, 0.15, -0.15], scale: [0.12, 0.1, 0.08], shape: 'sphere', mirror: true },
  'calves': { position: [-0.12, -0.6, -0.02], scale: [0.05, 0.16, 0.05], shape: 'cylinder', mirror: true },
};

function MuscleGroup({ muscle, side }: { muscle: Muscle; side?: 'left' | 'right' }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { highlights, setSelectedMuscle, selectedMuscle } = useStore();

  const geo = muscleGeometry[muscle.id];
  const highlight = highlights.find(h => h.muscleId === muscle.id);
  const isSelected = selectedMuscle?.id === muscle.id;

  const isMirrored = geo?.mirror && side === 'right';

  const baseColor = useMemo(() => {
    return highlight ? COLORS.default : COLORS.inactive;
  }, [highlight]);

  const targetColor = useMemo(() => {
    if (!highlight) return baseColor;
    if (highlight.level === 'none') return baseColor;
    return COLORS[highlight.level];
  }, [highlight, baseColor]);

  useFrame(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.color.lerp(targetColor, 0.15);

      if (highlight?.level === 'primary') {
        const pulse = Math.sin(Date.now() * 0.004) * 0.15 + 0.85;
        material.emissiveIntensity = pulse * 0.4;
        material.emissive.copy(targetColor);
      } else if (highlight?.level === 'secondary') {
        material.emissiveIntensity = 0.2;
        material.emissive.copy(targetColor);
      } else {
        material.emissiveIntensity = 0;
      }

      if (hovered || isSelected) {
        material.emissiveIntensity = Math.max(material.emissiveIntensity, 0.3);
        material.emissive.copy(targetColor);
      }
    }
  });

  if (!geo) return null;

  const xPos = isMirrored ? -geo.position[0] : geo.position[0];

  const GeometryComponent = geo.shape === 'box'
    ? <boxGeometry args={[1, 1, 1]} />
    : geo.shape === 'sphere'
    ? <sphereGeometry args={[0.5, 16, 16]} />
    : geo.shape === 'capsule'
    ? <capsuleGeometry args={[0.5, 1, 8, 16]} />
    : <cylinderGeometry args={[0.5, 0.5, 1, 16]} />;

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[xPos, geo.position[1], geo.position[2]]}
        scale={geo.scale}
        rotation={geo.rotation}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedMuscle(isSelected ? null : muscle);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {GeometryComponent}
        <meshStandardMaterial
          color={baseColor}
          roughness={0.5}
          metalness={0.1}
          emissive={new THREE.Color('#000000')}
          emissiveIntensity={0}
          transparent
          opacity={highlight ? 0.95 : 0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function MuscleMesh({ muscle }: MuscleMeshProps) {
  const geo = muscleGeometry[muscle.id];
  if (!geo) return null;

  if (geo.mirror) {
    return (
      <>
        <MuscleGroup muscle={muscle} side="left" />
        <MuscleGroup muscle={muscle} side="right" />
      </>
    );
  }

  return <MuscleGroup muscle={muscle} />;
}
