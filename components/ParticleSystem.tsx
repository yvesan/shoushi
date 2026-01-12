import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PARTICLE_COUNT, ANIMATION_SPEED } from '../constants';
import { ShapeType } from '../types';
import { getShapePositions } from '../services/mathUtils';

interface ParticleSystemProps {
  shape: ShapeType;
  color: string;
  handInfluence: number; // 0 to 1
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ shape, color, handInfluence }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  // Pre-calculate positions for all shapes to avoid recalculating every frame
  const geometries = useMemo(() => {
    return {
      [ShapeType.HEART]: getShapePositions(ShapeType.HEART, PARTICLE_COUNT),
      [ShapeType.FLOWER]: getShapePositions(ShapeType.FLOWER, PARTICLE_COUNT),
      [ShapeType.SATURN]: getShapePositions(ShapeType.SATURN, PARTICLE_COUNT),
      [ShapeType.FIREWORK]: getShapePositions(ShapeType.FIREWORK, PARTICLE_COUNT),
      [ShapeType.SPHERE]: getShapePositions(ShapeType.SPHERE, PARTICLE_COUNT),
    };
  }, []);

  // Current active positions (used for morphing)
  const currentPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  
  // Initialize positions on mount
  useEffect(() => {
    if (geometries[shape]) {
      currentPositions.set(geometries[shape]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;

    const targetPos = geometries[shape];
    const positionsAttr = meshRef.current.geometry.attributes.position;
    const array = positionsAttr.array as Float32Array;

    // Morphing & Interaction Loop
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // 1. Morph: Lerp current position towards target shape position
      const tx = targetPos[i3];
      const ty = targetPos[i3 + 1];
      const tz = targetPos[i3 + 2];

      // Lerp logic
      array[i3] += (tx - array[i3]) * ANIMATION_SPEED;
      array[i3 + 1] += (ty - array[i3 + 1]) * ANIMATION_SPEED;
      array[i3 + 2] += (tz - array[i3 + 2]) * ANIMATION_SPEED;

      // 2. Hand Interaction: Explode/Expand based on handInfluence
      // Calculate vector from center
      if (handInfluence > 0.05) {
        const x = array[i3];
        const y = array[i3 + 1];
        const z = array[i3 + 2];
        
        // Expansion factor
        const expansion = 1 + (handInfluence * 0.05); // Subtle expansion per frame
        
        // Simple radial push
        array[i3] = x * expansion;
        array[i3 + 1] = y * expansion;
        array[i3 + 2] = z * expansion;
      } else {
        // Gentle contraction back to shape if hand closed (handled by the lerp above naturally)
      }
    }

    positionsAttr.needsUpdate = true;

    // Slowly rotate the whole system
    meshRef.current.rotation.y += 0.002;
    // Tumble slightly based on hand movement
    meshRef.current.rotation.z += handInfluence * 0.01;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={currentPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleSystem;
