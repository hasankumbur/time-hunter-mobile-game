import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform, Animated, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { TimePortal } from './TimePortal';
import { BonusIndicator } from './BonusIndicator';
import { ActiveEffects } from './ActiveEffects';
import {
  LEVEL_SETTINGS,
  TimeObject,
  TimeObjectType,
  MIN_SIMULTANEOUS_SPAWNS,
  MAX_SIMULTANEOUS_SPAWNS,
  DIFFICULTY_SPEED_MULTIPLIER,
  MAX_PAUSE_COUNT,
} from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_AREA_TOP = Platform.OS === 'ios' ? 120 : 100;

const PORTAL_COLORS = {
  normal: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'],
  bonus: ['#FFD700', '#FFA500', '#FF8C00'],
  slowMotion: ['#9B59B6', '#8E44AD', '#6C3483'],
  speedBoost: ['#2ECC71', '#27AE60', '#229954'],
  dangerStar: ['#F1C40F', '#F39C12', '#D35400'],
  extraLife: ['#E74C3C', '#C0392B', '#922B21'],
};

export function GameEngine() {
  const {
    timeObjects,
    isPlaying,
    isPaused,
    isSlowMotion,
    isDifficultyIncreased,
    level,
    lives,
    pauseCount,
    updateTimeObjects,
    catchTimeObject,
    removeLife,
    checkEffects,
    togglePause,
  } = useGameStore();

  const lastSpawnRef = useRef<number>(0);
  const gameLoopRef = useRef<ReturnType<typeof setInterval>>();
  const objectsRef = useRef(timeObjects);
  const lastEffectCheckRef = useRef<number>(0);
  const [lastBonusType, setLastBonusType] = React.useState<TimeObjectType | null>(null);
  const bonusAnimationRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    objectsRef.current = timeObjects;
  }, [timeObjects]);

  const getRandomPortalType = useCallback((): TimeObjectType => {
    const settings = LEVEL_SETTINGS[level];
    const rand = Math.random();

    // Eğer can 1'se ve level 3'ten büyükse extra can çıkma şansını artır
    const extraLifeMultiplier = lives === 1 && level > 3 ? settings.extraLifeLowHealthMultiplier : 1;
    const adjustedExtraLifeChance = settings.extraLifeChance * extraLifeMultiplier;

    let currentProbability = 0;

    // Extra can bonusu
    currentProbability += adjustedExtraLifeChance;
    if (rand < currentProbability) return 'extraLife';

    // Tehlikeli yıldız
    currentProbability += settings.dangerStarChance;
    if (rand < currentProbability) return 'dangerStar';

    // Bonus portal
    currentProbability += settings.bonusChance;
    if (rand < currentProbability) return 'bonus';

    // Yavaşlatma portalı
    currentProbability += settings.slowMotionChance;
    if (rand < currentProbability) return 'slowMotion';

    // Hız portalı
    currentProbability += settings.speedBoostChance;
    if (rand < currentProbability) return 'speedBoost';

    return 'normal';
  }, [level, lives]);

  const createTimeObject = useCallback((): TimeObject => {
    const settings = LEVEL_SETTINGS[level];
    const type = getRandomPortalType();
    const size = type === 'dangerStar' ? 40 : Math.random() * 20 + 40;
    const x = Math.random() * (SCREEN_WIDTH - size);
    const colors = PORTAL_COLORS[type];

    const baseSpeed = Math.random() * (settings.maxSpeed - settings.minSpeed) + settings.minSpeed;
    const speed = isSlowMotion ? baseSpeed * 0.5 : isDifficultyIncreased ? baseSpeed * 1.5 : baseSpeed;

    let points = Math.floor(size / 10);
    if (type === 'bonus') points *= 2;
    if (type === 'slowMotion') points *= 1.5;
    if (type === 'speedBoost') points *= 1.8;
    if (type === 'dangerStar' || type === 'extraLife') points = 0;

    return {
      id: Math.random().toString(),
      x,
      y: -size + GAME_AREA_TOP,
      speed,
      size,
      points,
      color: colors[Math.floor(Math.random() * colors.length)],
      isActive: true,
      type,
      isDangerous: type === 'dangerStar',
    };
  }, [level, isSlowMotion, isDifficultyIncreased, getRandomPortalType]);

  const initializeGame = useCallback(() => {
    const settings = LEVEL_SETTINGS[level];
    const initialObjects = Array.from(
      { length: Math.ceil(settings.objectCount / 2) },
      createTimeObject
    );
    updateTimeObjects(initialObjects);
  }, [level, createTimeObject, updateTimeObjects]);

  const createMultipleTimeObjects = useCallback((count: number) => {
    // Her spawn grubunda sadece bir bonus portal olabilir
    const objects: TimeObject[] = [];
    let hasBonusPortal = false;

    for (let i = 0; i < count; i++) {
      const obj = createTimeObject();

      // Eğer bu bir bonus portal ve daha önce bonus portal eklenmişse, normal portale çevir
      if (obj.type !== 'normal' && obj.type !== 'dangerStar' && hasBonusPortal) {
        obj.type = 'normal';
        obj.points = Math.floor(obj.size / 10);
        obj.color = PORTAL_COLORS.normal[Math.floor(Math.random() * PORTAL_COLORS.normal.length)];
      }

      // Bonus portal eklendiğini işaretle
      if (obj.type !== 'normal' && obj.type !== 'dangerStar') {
        hasBonusPortal = true;
      }

      // Her portal için rastgele bir Y offset
      const randomOffset = Math.random() * 100 - 50; // -50 ile 50 arası
      objects.push({
        ...obj,
        y: obj.y + randomOffset,
      });
    }

    return objects;
  }, [createTimeObject]);

  const updateGame = useCallback(() => {
    if (!isPlaying || isPaused) return;

    const currentTime = Date.now();

    // Efektleri kontrol et
    if (currentTime - lastEffectCheckRef.current > 100) {
      checkEffects();
      lastEffectCheckRef.current = currentTime;
    }

    const settings = LEVEL_SETTINGS[level];
    const currentObjects = objectsRef.current;

    let shouldUpdate = false;
    let newObjects = [...currentObjects];

    // Yeni nesneler oluştur
    if (currentTime - lastSpawnRef.current > settings.spawnInterval) {
      const activeObjects = newObjects.filter(obj => obj.isActive);
      const maxAllowed = Math.min(settings.simultaneousPortals, MAX_SIMULTANEOUS_SPAWNS);
      const minRequired = Math.min(MIN_SIMULTANEOUS_SPAWNS, maxAllowed);

      if (activeObjects.length < maxAllowed) {
        const spawnCount = Math.max(
          minRequired,
          Math.floor(Math.random() * (maxAllowed - activeObjects.length + 1))
        );
        const newPortals = createMultipleTimeObjects(spawnCount);
        newObjects = [...newObjects, ...newPortals];
        shouldUpdate = true;
      }
      lastSpawnRef.current = currentTime;
    }

    // Nesne pozisyonlarını güncelle
    const updatedObjects = newObjects.map(obj => {
      // Yakalanan veya aktif olmayan portalleri güncelleme
      if (!obj.isActive || obj.isCaught) return obj;

      const speedMultiplier = isSlowMotion ? 0.5 : 1;
      const newY = obj.y + (obj.speed * speedMultiplier);

      if (newY > SCREEN_HEIGHT - 50) {
        if (!obj.isDangerous && obj.type !== 'bonus' && obj.type !== 'extraLife') {
          removeLife();
        }
        shouldUpdate = true;
        return { ...obj, isActive: false };
      }

      if (obj.y !== newY) {
        shouldUpdate = true;
        return { ...obj, y: newY };
      }

      return obj;
    });

    if (shouldUpdate) {
      updateTimeObjects(updatedObjects);
    }
  }, [isPlaying, isPaused, level, isSlowMotion, createTimeObject, updateTimeObjects, removeLife, checkEffects, createMultipleTimeObjects]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      if (!gameLoopRef.current) {
        initializeGame();
        lastSpawnRef.current = Date.now();
        lastEffectCheckRef.current = Date.now();
      }
      gameLoopRef.current = setInterval(updateGame, 16);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        if (!isPlaying) {
          gameLoopRef.current = undefined;
          updateTimeObjects([]);
        }
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, isPaused, level, initializeGame, updateGame]);

  const showBonusIndicator = useCallback((type: TimeObjectType) => {
    setLastBonusType(type);
    bonusAnimationRef.setValue(0);

    Animated.sequence([
      // Ortadan büyüyerek gelme
      Animated.timing(bonusAnimationRef, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Biraz bekle
      Animated.delay(500),
      // Sağ üste kayarak gitme
      Animated.timing(bonusAnimationRef, {
        toValue: 2,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setLastBonusType(null);
    });
  }, []);

  const handleCatchTimeObject = useCallback((id: string) => {
    const object = timeObjects.find(obj => obj.id === id);
    if (!object || !object.isActive || object.isCaught) return;

    // Önce portalin yakalandığını işaretle
    const updatedObjects = timeObjects.map(obj => {
      if (obj.id === id) {
        return { ...obj, isCaught: true };
      }
      return obj;
    });
    updateTimeObjects(updatedObjects);

    // Tehlike portalı yakalandığında diğer portallerin hızını artır
    if (object.type === 'dangerStar') {
      setTimeout(() => {
        const newObjects = updatedObjects.map(obj => {
          if (obj.isActive && !obj.isCaught && obj.id !== id) {
            return {
              ...obj,
              speed: obj.speed * DIFFICULTY_SPEED_MULTIPLIER,
            };
          }
          return obj;
        });
        updateTimeObjects(newObjects);
      }, 100); // Kısa bir gecikme ekleyerek animasyon senkronizasyonunu sağla
    }

    // Bonus göstergesini göster
    if (object.type !== 'normal' && object.type !== 'dangerStar') {
      showBonusIndicator(object.type);
    }

    // Son olarak yakalama işlemini tamamla
    setTimeout(() => {
      catchTimeObject(id);
    }, 400); // Animasyon tamamlanana kadar bekle
  }, [timeObjects, catchTimeObject, showBonusIndicator, updateTimeObjects]);

  const settings = LEVEL_SETTINGS[level];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[settings.theme.boardGradient[0], settings.theme.boardGradient[1]]}
        style={styles.gradient}
      >
        <View style={styles.gameArea}>
          {timeObjects.map(object => (
            <TimePortal
              key={object.id}
              object={object}
              onCatch={handleCatchTimeObject}
              isInteractive={isPlaying && !isPaused}
            />
          ))}
          {lastBonusType && (
            <BonusIndicator
              type={lastBonusType}
              animationProgress={bonusAnimationRef}
            />
          )}
          <ActiveEffects />
          {isPlaying && (
            <View style={styles.pauseContainer}>
              <TouchableOpacity
                style={[
                  styles.pauseButton,
                  !isPaused && pauseCount >= MAX_PAUSE_COUNT && styles.pauseButtonDisabled,
                ]}
                onPress={togglePause}
                disabled={!isPaused && pauseCount >= MAX_PAUSE_COUNT}
              >
                <Text style={styles.pauseButtonText}>
                  {isPaused ? 'Devam Et' : 'Durdur'}
                </Text>
                <Text style={styles.pauseCountText}>
                  {MAX_PAUSE_COUNT - pauseCount} Hak
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
    padding: 2,
  },
  gameArea: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  pauseContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  pauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 140,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4ECDC4',
    elevation: 8,
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  pauseButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderColor: '#666',
    shadowOpacity: 0,
  },
  pauseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pauseCountText: {
    color: '#4ECDC4',
    fontSize: 14,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 