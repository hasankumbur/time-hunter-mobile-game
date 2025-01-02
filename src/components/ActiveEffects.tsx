import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useGameStore } from '../store/gameStore';

interface EffectTimerProps {
  endTime: number;
  type: 'slowMotion' | 'speedBoost' | 'difficultyIncrease';
}

const EFFECT_NAMES = {
  slowMotion: 'Yavaşlatma',
  speedBoost: 'Hızlandırma',
  difficultyIncrease: 'Zorlaştırma',
};

const EFFECT_COLORS = {
  slowMotion: '#9B59B6',
  speedBoost: '#2ECC71',
  difficultyIncrease: '#F1C40F',
};

function EffectTimer({ endTime, type }: EffectTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const progressAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    // Progress bar animasyonu
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: endTime - Date.now(),
      useNativeDriver: false,
    }).start();

    return () => clearInterval(interval);
  }, [endTime]);

  if (timeLeft <= 0) return null;

  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerHeader}>
        <Text style={styles.timerText}>{EFFECT_NAMES[type]}</Text>
        <Text style={styles.timerCountdown}>{Math.ceil(timeLeft / 1000)}s</Text>
      </View>
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: EFFECT_COLORS[type],
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

export function ActiveEffects() {
  const {
    isSlowMotion,
    slowMotionEndTime,
    speedBoostEndTime,
    isDifficultyIncreased,
    difficultyEndTime,
  } = useGameStore();

  return (
    <View style={styles.container}>
      {isSlowMotion && slowMotionEndTime && (
        <EffectTimer type="slowMotion" endTime={slowMotionEndTime} />
      )}
      {speedBoostEndTime && (
        <EffectTimer type="speedBoost" endTime={speedBoostEndTime} />
      )}
      {isDifficultyIncreased && difficultyEndTime && (
        <EffectTimer type="difficultyIncrease" endTime={difficultyEndTime} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 100,
    gap: 8,
  },
  timerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 8,
    width: 150,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timerCountdown: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
  },
}); 