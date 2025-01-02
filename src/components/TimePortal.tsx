import React, { memo, useEffect, useCallback } from 'react';
import { Canvas, Circle, Group, Paint, Path, vec, Blur, RadialGradient } from '@shopify/react-native-skia';
import { TouchableOpacity, StyleSheet, View, Platform, Animated, Text } from 'react-native';
import type { TimeObject } from '../types';

interface TimePortalProps {
  object: TimeObject;
  onCatch: (id: string) => void;
  isInteractive: boolean;
}

const GLOW_COLORS = {
  normal: 'rgba(255, 255, 255, 0.3)',
  bonus: 'rgba(255, 215, 0, 0.4)',
  slowMotion: 'rgba(155, 89, 182, 0.4)',
  speedBoost: 'rgba(46, 204, 113, 0.4)',
  dangerStar: 'rgba(241, 196, 15, 0.4)',
  extraLife: 'rgba(231, 76, 60, 0.4)',
};

const PORTAL_DESCRIPTIONS = {
  normal: '',
  bonus: '2x Puan',
  slowMotion: 'Yavaşlatma',
  speedBoost: 'Hızlı Puan',
  dangerStar: 'Dikkat!',
  extraLife: '+1 Can',
};

function TimePortalComponent({ object, onCatch, isInteractive }: TimePortalProps) {
  const { x, y, size, color, isActive, id, type, isCaught } = object;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const labelOpacityAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;
  const explosionScaleAnim = React.useRef(new Animated.Value(0)).current;
  const explosionOpacityAnim = React.useRef(new Animated.Value(0)).current;

  // Animasyonları durdur fonksiyonu
  const stopAnimations = useCallback(() => {
    pulseAnim.stopAnimation();
    rotateAnim.stopAnimation();
    labelOpacityAnim.stopAnimation();
  }, [pulseAnim, rotateAnim, labelOpacityAnim]);

  useEffect(() => {
    if (isCaught) {
      // Portal yakalandığında tüm animasyonları durdur
      stopAnimations();
      
      // Yakalama animasyonunu başlat
      Animated.parallel([
        // Portal küçülme ve kaybolma
        Animated.sequence([
          // Önce hafif büyüme
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
          // Sonra küçülerek kaybolma
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Transparanlık azalma
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        // Patlama efekti
        Animated.sequence([
          // Patlama büyüme ve kaybolma
          Animated.parallel([
            Animated.timing(explosionScaleAnim, {
              toValue: 1.5,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.sequence([
              // Patlama görünür olma
              Animated.timing(explosionOpacityAnim, {
                toValue: 0.6,
                duration: 100,
                useNativeDriver: true,
              }),
              // Patlama kaybolma
              Animated.timing(explosionOpacityAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),
      ]).start();
      return;
    }

    // Normal animasyonlar (yakalanmamış portal için)
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: type === 'dangerStar' ? 1.3 : 1.2,
          duration: type === 'normal' ? 2000 : type === 'dangerStar' ? 800 : 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: type === 'normal' ? 2000 : type === 'dangerStar' ? 800 : 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: type === 'dangerStar' ? 2000 : 4000,
        useNativeDriver: true,
      })
    );

    const labelAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(labelOpacityAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(labelOpacityAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    if (type === 'dangerStar') {
      rotateAnimation.start();
    }
    if (type !== 'normal') {
      labelAnimation.start();
    }

    return () => {
      stopAnimations();
    };
  }, [type, isCaught, stopAnimations]);

  const handlePress = useCallback(() => {
    if (isInteractive && isActive && !isCaught) {
      onCatch(id);
    }
  }, [isInteractive, isActive, isCaught, id, onCatch]);

  if (!isActive) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const createStarPath = (centerX: number, centerY: number, outerRadius: number, innerRadius: number) => {
    const points = 5;
    let path = '';
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const x = centerX + radius * Math.sin(angle);
      const y = centerY - radius * Math.cos(angle);
      
      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    
    path += ' Z';
    return path;
  };

  const getInnerDesign = () => {
    switch (type) {
      case 'dangerStar': {
        const centerX = size / 2;
        const centerY = size / 2;
        const outerRadius = size / 2;
        const innerRadius = size / 4;
        const starPath = createStarPath(centerX, centerY, outerRadius, innerRadius);
        
        return (
          <>
            <Path
              path={starPath}
              color={color}
            >
              <Paint style="fill" />
              <Paint style="stroke" strokeWidth={2} color="gold" />
            </Path>
          </>
        );
      }
      case 'extraLife':
        return (
          <>
            <Circle cx={size / 2} cy={size / 2} r={size / 3} color={GLOW_COLORS.extraLife}>
              <Paint style="stroke" strokeWidth={2} color="#E74C3C" />
            </Circle>
            <Path
              path={`M ${size/2 - size/6} ${size/2} h ${size/3} M ${size/2} ${size/2 - size/6} v ${size/3}`}
              color="#E74C3C"
              style="stroke"
              strokeWidth={3}
            />
          </>
        );
      case 'bonus':
        return (
          <>
            <Circle cx={size / 2} cy={size / 2} r={size / 3} color={GLOW_COLORS.bonus}>
              <Paint style="stroke" strokeWidth={2} color="gold" />
            </Circle>
            <Circle cx={size / 2} cy={size / 2} r={size / 4} color="gold" opacity={0.5} />
          </>
        );
      case 'slowMotion':
        return (
          <>
            <Circle cx={size / 2} cy={size / 2} r={size / 3} color={GLOW_COLORS.slowMotion}>
              <Paint style="stroke" strokeWidth={2} color="purple" />
            </Circle>
            <Circle cx={size / 2} cy={size / 2} r={size / 4} color="purple" opacity={0.5} />
          </>
        );
      case 'speedBoost':
        return (
          <>
            <Circle cx={size / 2} cy={size / 2} r={size / 3} color={GLOW_COLORS.speedBoost}>
              <Paint style="stroke" strokeWidth={2} color="green" />
            </Circle>
            <Circle cx={size / 2} cy={size / 2} r={size / 4} color="green" opacity={0.5} />
          </>
        );
      default:
        return (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 3}
            color={GLOW_COLORS.normal}
            opacity={0.3}
          />
        );
    }
  };

  return (
    <View style={[styles.wrapper, { transform: [{ translateX: x }, { translateY: y }] }]}>
      {/* Patlama efekti */}
      <Animated.View
        style={[
          styles.explosion,
          {
            width: size * 1.5,
            height: size * 1.5,
            transform: [
              { scale: explosionScaleAnim },
              { translateX: -size * 0.25 },
              { translateY: -size * 0.25 },
            ],
            opacity: explosionOpacityAnim,
          },
        ]}
      >
        <Canvas style={{ flex: 1 }}>
          <Group>
            <Circle cx={size * 0.75} cy={size * 0.75} r={size * 0.4} color={color}>
              <Paint>
                <RadialGradient
                  c={vec(size * 0.75, size * 0.75)}
                  r={size * 0.75}
                  colors={['white', color, 'transparent']}
                />
              </Paint>
            </Circle>
          </Group>
        </Canvas>
      </Animated.View>

      <TouchableOpacity
        style={[
          styles.container,
          {
            transform: [
              { scale: Animated.multiply(pulseAnim, scaleAnim) as any },
              { rotate: type === 'dangerStar' ? (rotate as any) : '0deg' },
            ],
            width: size,
            height: size,
            opacity: opacityAnim,
          },
        ]}
        onPress={handlePress}
        activeOpacity={isInteractive ? 0.8 : 1}
        disabled={!isInteractive || isCaught}
      >
        <View style={[styles.portalContainer, type === 'dangerStar' && styles.dangerStar]}>
          <Canvas style={styles.canvas}>
            <Group>
              {type === 'dangerStar' ? (
                getInnerDesign()
              ) : (
                <Circle cx={size / 2} cy={size / 2} r={size / 2} color={color}>
                  {getInnerDesign()}
                </Circle>
              )}
            </Group>
          </Canvas>
        </View>
      </TouchableOpacity>

      {type !== 'normal' && !isCaught && (
        <Animated.View 
          style={[
            styles.labelContainer,
            { opacity: labelOpacityAnim }
          ]}
        >
          <Text style={[
            styles.description,
            (type === 'dangerStar' || type === 'extraLife') && styles.specialDescription
          ]}>
            {PORTAL_DESCRIPTIONS[type]}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

export const TimePortal = memo(TimePortalComponent);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
  },
  container: {
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  portalContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  dangerStar: {
    borderRadius: 0,
    overflow: 'visible',
  },
  canvas: {
    flex: 1,
  },
  labelContainer: {
    position: 'absolute',
    top: '100%',
    paddingTop: 5,
    alignItems: 'center',
    minWidth: 80,
  },
  description: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  specialDescription: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  explosion: {
    position: 'absolute',
    zIndex: 2,
  },
}); 