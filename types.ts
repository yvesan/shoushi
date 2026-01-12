export enum ShapeType {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  FIREWORK = 'Firework',
  SPHERE = 'Sphere'
}

export interface ParticleConfig {
  count: number;
  size: number;
  color: string;
}

// MediaPipe Types (Simplified for use without full npm package)
export interface HandLandmarkerResult {
  landmarks: Array<Array<{ x: number; y: number; z: number }>>;
}

export interface VisionTaskRunner {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => HandLandmarkerResult;
  close: () => void;
}