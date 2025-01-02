import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import type { TimeObjectType } from '../types';

interface BonusIndicatorProps {
  type: TimeObjectType;
  animationProgress: Animated.Value;
}

const BONUS_MESSAGES = {
  bonus: '2X BONUS!',
  slowMotion: 'YAVAŞLATMA!',
  speedBoost: 'HIZ BONUSU!',
  extraLife: '+1 CAN!',
};

const BONUS_COLORS = {
  bonus: '#FFD700',
  slowMotion: '#9B59B6',
  speedBoost: '#2ECC71',
  extraLife: '#E74C3C',
};

export function BonusIndicator({ type, animationProgress }: BonusIndicatorProps) {
  if (type === 'normal' || type === 'dangerStar') return null;

  const message = BONUS_MESSAGES[type];
  const color = BONUS_COLORS[type];

  const scale = animationProgress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.3, 1, 0.8],
  });

  const translateY = animationProgress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [100, 0, -50],
  });

  const translateX = animationProgress.interpolate({
    inputRange: [0, 1, 1.5, 2],
    outputRange: [0, 0, 100, 150],
  });

  const opacity = animationProgress.interpolate({
    inputRange: [0, 0.1, 1, 1.8, 2],
    outputRange: [0, 1, 1, 0.3, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale },
            { translateY },
            { translateX },
          ],
          opacity,
        },
      ]}
    >
      <Text style={[styles.text, { color }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [
      { translateX: -75 }, // container width'in yarısı
      { translateY: -25 }, // container height'ın yarısı
    ],
    width: 150,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    zIndex: 1000,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 