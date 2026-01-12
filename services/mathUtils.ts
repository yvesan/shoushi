import * as THREE from 'three';
import { ShapeType } from '../types';

export const getShapePositions = (type: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const v = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    switch (type) {
      case ShapeType.HEART: {
        // Parametric Heart
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        
        // Base distribution
        const x = 16 * Math.pow(Math.sin(theta), 3);
        const y = 13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta);
        const z = 4 * Math.cos(theta) * Math.sin(phi) * Math.sin(theta); // Give it thickness

        v.set(x, y, z).multiplyScalar(0.15); // Scale down
        break;
      }

      case ShapeType.SATURN: {
        const r = Math.random();
        if (r > 0.4) {
          // Ring
          const angle = Math.random() * Math.PI * 2;
          const radius = 3 + Math.random() * 2;
          v.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 0.1, Math.sin(angle) * radius);
          // Tilt
          v.applyAxisAngle(new THREE.Vector3(1, 0, 1).normalize(), Math.PI / 6);
        } else {
          // Planet Body
          const theta = Math.acos(THREE.MathUtils.randFloatSpread(2));
          const phi = Math.random() * Math.PI * 2;
          const radius = 1.5;
          v.setFromSphericalCoords(radius, theta, phi);
        }
        break;
      }

      case ShapeType.FLOWER: {
        // Rose/Flower parametric
        const k = 4; // Petals
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const r = 2 + Math.cos(k * theta) * Math.sin(phi);
        v.setFromSphericalCoords(r, phi, theta);
        break;
      }

      case ShapeType.FIREWORK: {
        // Explosion bursts
        const u = Math.random();
        const v_ang = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v_ang - 1);
        const r = Math.cbrt(Math.random()) * 4; // Uniform sphere volume
        v.setFromSphericalCoords(r, phi, theta);
        break;
      }

      case ShapeType.SPHERE:
      default: {
        const theta = Math.acos(THREE.MathUtils.randFloatSpread(2));
        const phi = Math.random() * Math.PI * 2;
        v.setFromSphericalCoords(3, theta, phi);
        break;
      }
    }

    // Add slight jitter for organic feel
    v.x += (Math.random() - 0.5) * 0.1;
    v.y += (Math.random() - 0.5) * 0.1;
    v.z += (Math.random() - 0.5) * 0.1;

    positions[i3] = v.x;
    positions[i3 + 1] = v.y;
    positions[i3 + 2] = v.z;
  }

  return positions;
};
