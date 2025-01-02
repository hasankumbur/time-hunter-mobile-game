export type TimeObjectType = 'normal' | 'bonus' | 'slowMotion' | 'speedBoost' | 'dangerStar' | 'extraLife';

export interface TimeObject {
  id: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  points: number;
  color: string;
  isActive: boolean;
  isCaught?: boolean;
  type: TimeObjectType;
  effectDuration?: number;
  isDangerous?: boolean;
}

export interface GameState {
  score: number;
  level: number;
  timeObjects: TimeObject[];
  isPlaying: boolean;
  lives: number;
  highScore: number;
  isPaused: boolean;
  pauseCount: number;
  isSlowMotion: boolean;
  slowMotionEndTime: number | null;
  speedBoostEndTime: number | null;
  currentMultiplier: number;
  isDifficultyIncreased: boolean;
  difficultyEndTime: number | null;
}

export interface GameSettings {
  minSpeed: number;
  maxSpeed: number;
  objectCount: number;
  spawnInterval: number;
  requiredScore: number;
  bonusChance: number;
  slowMotionChance: number;
  speedBoostChance: number;
  dangerStarChance: number;
  extraLifeChance: number;
  extraLifeLowHealthMultiplier: number;
  simultaneousPortals: number;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    boardGradient: string[];
  };
}

export const INITIAL_LIVES = 3;
export const MAX_PAUSE_COUNT = 3;
export const SLOW_MOTION_DURATION = 5000;
export const SPEED_BOOST_DURATION = 3000;
export const DIFFICULTY_INCREASE_DURATION = 8000;
export const DIFFICULTY_SPEED_MULTIPLIER = 1.15;
export const MIN_SIMULTANEOUS_SPAWNS = 1;
export const MAX_SIMULTANEOUS_SPAWNS = 3;
export const BASE_POINTS = 10;

export const LEVEL_SETTINGS: Record<number, GameSettings> = {
  1: {
    minSpeed: 2,
    maxSpeed: 4,
    objectCount: 3,
    spawnInterval: 2000,
    requiredScore: 50,
    bonusChance: 0.015,
    slowMotionChance: 0.012,
    speedBoostChance: 0,
    dangerStarChance: 0.05,
    extraLifeChance: 0.02,
    extraLifeLowHealthMultiplier: 1.5,
    simultaneousPortals: 2,
    theme: {
      primary: '#4ECDC4',
      secondary: '#FFD93D',
      accent: '#FF6B6B',
      background: '#2C3E50',
      boardGradient: ['#2C3E50', '#3498DB'],
    },
  },
  2: {
    minSpeed: 3,
    maxSpeed: 5,
    objectCount: 4,
    spawnInterval: 1800,
    requiredScore: 150,
    bonusChance: 0.012,
    slowMotionChance: 0.012,
    speedBoostChance: 0.006,
    dangerStarChance: 0.06,
    extraLifeChance: 0.02,
    extraLifeLowHealthMultiplier: 1.6,
    simultaneousPortals: 2,
    theme: {
      primary: '#45B7D1',
      secondary: '#96CEB4',
      accent: '#FFEEAD',
      background: '#34495E',
      boardGradient: ['#34495E', '#2980B9'],
    },
  },
  3: {
    minSpeed: 4,
    maxSpeed: 6,
    objectCount: 5,
    spawnInterval: 1600,
    requiredScore: 300,
    bonusChance: 0.01,
    slowMotionChance: 0.009,
    speedBoostChance: 0.009,
    dangerStarChance: 0.08,
    extraLifeChance: 0.03,
    extraLifeLowHealthMultiplier: 1.7,
    simultaneousPortals: 2,
    theme: {
      primary: '#9B59B6',
      secondary: '#E74C3C',
      accent: '#F1C40F',
      background: '#2E4053',
      boardGradient: ['#2E4053', '#8E44AD'],
    },
  },
  4: {
    minSpeed: 5,
    maxSpeed: 7,
    objectCount: 6,
    spawnInterval: 1400,
    requiredScore: 500,
    bonusChance: 0.009,
    slowMotionChance: 0.0075,
    speedBoostChance: 0.012,
    dangerStarChance: 0.1,
    extraLifeChance: 0.04,
    extraLifeLowHealthMultiplier: 1.8,
    simultaneousPortals: 2,
    theme: {
      primary: '#3498DB',
      secondary: '#E67E22',
      accent: '#2ECC71',
      background: '#283747',
      boardGradient: ['#283747', '#E74C3C'],
    },
  },
  5: {
    minSpeed: 6,
    maxSpeed: 8,
    objectCount: 7,
    spawnInterval: 1200,
    requiredScore: 800,
    bonusChance: 0.0075,
    slowMotionChance: 0.006,
    speedBoostChance: 0.015,
    dangerStarChance: 0.12,
    extraLifeChance: 0.05,
    extraLifeLowHealthMultiplier: 1.9,
    simultaneousPortals: 3,
    theme: {
      primary: '#1ABC9C',
      secondary: '#D35400',
      accent: '#8E44AD',
      background: '#212F3C',
      boardGradient: ['#212F3C', '#C0392B'],
    },
  },
  6: {
    minSpeed: 7,
    maxSpeed: 9,
    objectCount: 8,
    spawnInterval: 1100,
    requiredScore: 1200,
    bonusChance: 0.006,
    slowMotionChance: 0.0045,
    speedBoostChance: 0.012,
    dangerStarChance: 0.15,
    extraLifeChance: 0.06,
    extraLifeLowHealthMultiplier: 2.0,
    simultaneousPortals: 3,
    theme: {
      primary: '#16A085',
      secondary: '#D35400',
      accent: '#8E44AD',
      background: '#1C2833',
      boardGradient: ['#1C2833', '#7D3C98'],
    },
  },
  7: {
    minSpeed: 8,
    maxSpeed: 10,
    objectCount: 9,
    spawnInterval: 1000,
    requiredScore: 1700,
    bonusChance: 0.006,
    slowMotionChance: 0.0045,
    speedBoostChance: 0.009,
    dangerStarChance: 0.18,
    extraLifeChance: 0.07,
    extraLifeLowHealthMultiplier: 2.1,
    simultaneousPortals: 3,
    theme: {
      primary: '#2980B9',
      secondary: '#E74C3C',
      accent: '#F1C40F',
      background: '#17202A',
      boardGradient: ['#17202A', '#6C3483'],
    },
  },
  8: {
    minSpeed: 9,
    maxSpeed: 11,
    objectCount: 10,
    spawnInterval: 900,
    requiredScore: 2300,
    bonusChance: 0.0045,
    slowMotionChance: 0.003,
    speedBoostChance: 0.0075,
    dangerStarChance: 0.2,
    extraLifeChance: 0.08,
    extraLifeLowHealthMultiplier: 2.2,
    simultaneousPortals: 3,
    theme: {
      primary: '#8E44AD',
      secondary: '#E67E22',
      accent: '#2ECC71',
      background: '#1B2631',
      boardGradient: ['#1B2631', '#943126'],
    },
  },
  9: {
    minSpeed: 10,
    maxSpeed: 12,
    objectCount: 11,
    spawnInterval: 800,
    requiredScore: 3000,
    bonusChance: 0.0045,
    slowMotionChance: 0.003,
    speedBoostChance: 0.006,
    dangerStarChance: 0.22,
    extraLifeChance: 0.09,
    extraLifeLowHealthMultiplier: 2.3,
    simultaneousPortals: 3,
    theme: {
      primary: '#2C3E50',
      secondary: '#E74C3C',
      accent: '#F1C40F',
      background: '#151515',
      boardGradient: ['#151515', '#922B21'],
    },
  },
  10: {
    minSpeed: 11,
    maxSpeed: 13,
    objectCount: 12,
    spawnInterval: 700,
    requiredScore: 4000,
    bonusChance: 0.003,
    slowMotionChance: 0.0015,
    speedBoostChance: 0.0045,
    dangerStarChance: 0.25,
    extraLifeChance: 0.1,
    extraLifeLowHealthMultiplier: 2.5,
    simultaneousPortals: 3,
    theme: {
      primary: '#34495E',
      secondary: '#C0392B',
      accent: '#F39C12',
      background: '#0A0A0A',
      boardGradient: ['#0A0A0A', '#641E16'],
    },
  },
}; 