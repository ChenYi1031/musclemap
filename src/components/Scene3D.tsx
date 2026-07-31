import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { HumanModel } from './HumanModel';

export function Scene3D() {
  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} />
        <pointLight position={[0, -3, 3]} intensity={0.3} />

        <HumanModel />

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
