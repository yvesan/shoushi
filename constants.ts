import { ShapeType } from './types';

export const PARTICLE_COUNT = 4000;
export const ANIMATION_SPEED = 0.05; // Morphing speed

export const COLORS = [
  '#FF0055', // Hot Pink
  '#00FFFF', // Cyan
  '#FFD700', // Gold
  '#ADFF2F', // GreenYellow
  '#FFFFFF', // White
];

export const SHAPE_ICONS: Record<ShapeType, string> = {
  [ShapeType.HEART]: '❤️',
  [ShapeType.FLOWER]: '🌸',
  [ShapeType.SATURN]: '🪐',
  [ShapeType.FIREWORK]: '🎆',
  [ShapeType.SPHERE]: '🔮',
};

export const SHAPE_LABELS: Record<ShapeType, string> = {
  [ShapeType.HEART]: '爱心',
  [ShapeType.FLOWER]: '花朵',
  [ShapeType.SATURN]: '土星',
  [ShapeType.FIREWORK]: '烟花',
  [ShapeType.SPHERE]: '水晶球',
};
