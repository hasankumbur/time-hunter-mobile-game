import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGameStore } from '../store/gameStore';
import { GameEngine } from '../components/GameEngine';
import { MAX_PAUSE_COUNT } from '../types';

export function GameScreen() {
  const {
    score,
    level,
    lives,
    isPlaying,
    isPaused,
    highScore,
    startGame,
    endGame,
    togglePause,
  } = useGameStore();

  useEffect(() => {
    return () => {
      endGame();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Skor: {score}</Text>
          <Text style={styles.statsText}>Seviye: {level}</Text>
          <Text style={styles.statsText}>Can: {lives}</Text>
        </View>
        <Text style={styles.highScoreText}>En Yüksek Skor: {highScore}</Text>
      </View>

      <View style={styles.gameContainer}>
        {!isPlaying ? (
          <View style={styles.menuContainer}>
            <Text style={styles.title}>Zaman Avcısı</Text>
            <TouchableOpacity style={styles.button} onPress={startGame}>
              <Text style={styles.buttonText}>
                {score > 0 ? 'Tekrar Oyna' : 'Oyuna Başla'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {isPaused && (
              <View style={styles.pauseOverlay}>
                <Text style={styles.pauseOverlayText}>OYUN DURAKLATILDI</Text>
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={togglePause}
                >
                  <Text style={styles.resumeButtonText}>DEVAM ET</Text>
                </TouchableOpacity>
              </View>
            )}
            <GameEngine />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  highScoreText: {
    color: '#FFD700',
    fontSize: 16,
    textAlign: 'center',
  },
  gameContainer: {
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pauseOverlayText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  resumeButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 