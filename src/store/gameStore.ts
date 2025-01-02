import { create } from 'zustand';
import {
  GameState,
  TimeObject,
  INITIAL_LIVES,
  MAX_PAUSE_COUNT,
  LEVEL_SETTINGS,
  SLOW_MOTION_DURATION,
  SPEED_BOOST_DURATION,
  DIFFICULTY_INCREASE_DURATION,
  BASE_POINTS,
} from '../types';

interface GameActions {
  startGame: () => void;
  endGame: () => void;
  addScore: (points: number) => void;
  removeLife: () => void;
  addLife: () => void;
  updateLevel: (level: number) => void;
  updateTimeObjects: (objects: TimeObject[]) => void;
  catchTimeObject: (id: string) => void;
  togglePause: () => void;
  applySlowMotion: () => void;
  applySpeedBoost: () => void;
  applyDifficultyIncrease: () => void;
  checkEffects: () => void;
}

const initialState: GameState = {
  score: 0,
  level: 1,
  timeObjects: [],
  isPlaying: false,
  lives: INITIAL_LIVES,
  highScore: 0,
  isPaused: false,
  pauseCount: 0,
  isSlowMotion: false,
  slowMotionEndTime: null,
  speedBoostEndTime: null,
  currentMultiplier: 1,
  isDifficultyIncreased: false,
  difficultyEndTime: null,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  startGame: () => {
    set({
      ...initialState,
      isPlaying: true,
      timeObjects: [],
    });
  },

  endGame: () => {
    const { score } = get();
    set(state => ({
      isPlaying: false,
      highScore: Math.max(state.highScore, score),
      timeObjects: [],
      isSlowMotion: false,
      slowMotionEndTime: null,
      speedBoostEndTime: null,
      currentMultiplier: 1,
      isDifficultyIncreased: false,
      difficultyEndTime: null,
    }));
  },

  addScore: (points: number) => {
    set(state => {
      const { level, currentMultiplier } = state;
      const newScore = state.score + (points * currentMultiplier);
      const settings = LEVEL_SETTINGS[level];
      const nextLevel = level < 10 && newScore >= settings.requiredScore ? level + 1 : level;

      if (nextLevel > level) {
        return {
          score: Math.round(newScore * 100) / 100,
          level: nextLevel,
          isSlowMotion: false,
          slowMotionEndTime: null,
          speedBoostEndTime: null,
          currentMultiplier: 1,
          isDifficultyIncreased: false,
          difficultyEndTime: null,
        };
      }
      return { score: Math.round(newScore * 100) / 100 };
    });
  },

  removeLife: () => {
    set(state => {
      const newLives = state.lives - 1;
      if (newLives <= 0) {
        get().endGame();
      }
      return { lives: newLives };
    });
  },

  addLife: () => {
    set(state => ({
      lives: Math.min(state.lives + 1, INITIAL_LIVES),
    }));
  },

  updateLevel: (level: number) => {
    set({ level });
  },

  updateTimeObjects: (objects: TimeObject[]) => {
    set({ timeObjects: objects });
  },

  catchTimeObject: (id: string) => {
    set(state => {
      const object = state.timeObjects.find(obj => obj.id === id);
      if (object && object.isActive) {
        if (object.type === 'dangerStar') {
          get().applyDifficultyIncrease();
          return {
            timeObjects: state.timeObjects.map(obj =>
              obj.id === id ? { ...obj, isActive: false } : obj
            ),
          };
        }

        if (object.type === 'extraLife') {
          get().addLife();
          return {
            timeObjects: state.timeObjects.map(obj =>
              obj.id === id ? { ...obj, isActive: false } : obj
            ),
          };
        }

        if (object.points > 0) {
          get().addScore(object.points);
        }

        switch (object.type) {
          case 'slowMotion':
            get().applySlowMotion();
            break;
          case 'speedBoost':
            get().applySpeedBoost();
            break;
        }

        return {
          timeObjects: state.timeObjects.map(obj =>
            obj.id === id ? { ...obj, isActive: false } : obj
          ),
        };
      }
      return state;
    });
  },

  togglePause: () => {
    const { isPaused, pauseCount } = get();
    if (!isPaused && pauseCount >= MAX_PAUSE_COUNT) return;

    set(state => ({
      isPaused: !state.isPaused,
      pauseCount: !state.isPaused ? state.pauseCount + 1 : state.pauseCount,
    }));
  },

  applySlowMotion: () => {
    const endTime = Date.now() + SLOW_MOTION_DURATION;
    set({
      isSlowMotion: true,
      slowMotionEndTime: endTime,
      currentMultiplier: 1.5,
    });
  },

  applySpeedBoost: () => {
    const endTime = Date.now() + SPEED_BOOST_DURATION;
    set({
      speedBoostEndTime: endTime,
      currentMultiplier: 2,
    });
  },

  applyDifficultyIncrease: () => {
    const endTime = Date.now() + DIFFICULTY_INCREASE_DURATION;
    set({
      isDifficultyIncreased: true,
      difficultyEndTime: endTime,
    });
  },

  checkEffects: () => {
    const { slowMotionEndTime, speedBoostEndTime, difficultyEndTime } = get();
    const currentTime = Date.now();

    if (slowMotionEndTime && currentTime >= slowMotionEndTime) {
      set({
        isSlowMotion: false,
        slowMotionEndTime: null,
        currentMultiplier: speedBoostEndTime ? 2 : 1,
      });
    }

    if (speedBoostEndTime && currentTime >= speedBoostEndTime) {
      set({
        speedBoostEndTime: null,
        currentMultiplier: slowMotionEndTime ? 1.5 : 1,
      });
    }

    if (difficultyEndTime && currentTime >= difficultyEndTime) {
      set({
        isDifficultyIncreased: false,
        difficultyEndTime: null,
      });
    }
  },
})); 