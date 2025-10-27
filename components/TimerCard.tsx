import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import * as Haptics from 'expo-haptics';
import LinearGradient from 'react-native-linear-gradient';
import { Timer, TimerState } from '../hooks/useTimers';

interface TimerCardProps {
  timer: Timer;
  onToggle: (id: string) => void;
  onEdit: (timer: Timer) => void;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
  formatTime: (seconds: number) => string;
  style?: any;
}

const getGradientColors = (state: TimerState): [string, string] => {
  switch (state) {
    case 'running':
      return ['#00c853', '#b2ff59']; // Green gradient
    case 'paused':
      return ['#ff9800', '#ffc107']; // Orange gradient
    case 'idle':
    default:
      return ['#1e3c72', '#2a5298']; // Blue gradient
  }
};

const TimerCard: React.FC<TimerCardProps> = ({
  timer,
  onToggle,
  onEdit,
  onReset,
  onRemove,
  formatTime,
  style,
}) => {
  const gradientColors = getGradientColors(timer.state);
  const [isFlashing, setIsFlashing] = useState(false);
  const flashAnimation = useRef(new Animated.Value(1)).current;
  const prevStateRef = useRef<{ state: string; remainingTime: number }>({ 
    state: timer.state, 
    remainingTime: timer.remainingTime 
  });
  
  // Check if timer is finished
  const isFinished = timer.state === 'idle' && timer.remainingTime === 0;
  
  // Start flashing only when timer actually finishes (transitions from running to finished)
  useEffect(() => {
    const prevState = prevStateRef.current;
    const justFinished = 
      prevState.state === 'running' && 
      prevState.remainingTime > 0 && 
      timer.state === 'idle' && 
      timer.remainingTime === 0;
    
    if (justFinished && !isFlashing) {
      setIsFlashing(true);
      startFlashing();
      // Add haptic feedback when timer finishes
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (!isFinished && isFlashing) {
      setIsFlashing(false);
      stopFlashing();
    }
    
    // Update previous state
    prevStateRef.current = { state: timer.state, remainingTime: timer.remainingTime };
  }, [timer.state, timer.remainingTime, isFlashing]);
  
  const startFlashing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnimation, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
  const stopFlashing = () => {
     flashAnimation.stopAnimation();
     flashAnimation.setValue(1); // Reset to full opacity immediately
   };

  const handlePress = () => {
    // Stop flashing when timer is tapped
    if (isFlashing) {
      setIsFlashing(false);
      stopFlashing();
    }
    
    // Add haptic feedback for timer start/pause
    if (timer.state === 'idle' || timer.state === 'paused') {
      // Starting timer - medium impact
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (timer.state === 'running') {
      // Pausing timer - light impact
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onToggle(timer.id);
  };

  const handleLongPress = () => {
    Alert.alert(
      'Timer Options',
      `What would you like to do with "${timer.name}"?`,
      [
        {
          text: 'Edit',
          onPress: () => onEdit(timer),
        },
        {
          text: 'Reset',
          onPress: () => onReset(timer.id),
        },
        {
          text: 'Resume',
          onPress: () => onToggle(timer.id),
          style: timer.state === 'paused' ? 'default' : 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            Alert.alert(
              'Confirm Remove',
              `Are you sure you want to remove "${timer.name}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => onRemove(timer.id) },
              ]
            );
          },
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const getStateText = () => {
    switch (timer.state) {
      case 'running':
        return 'RUNNING';
      case 'paused':
        return 'PAUSED';
      case 'idle':
        return timer.remainingTime === 0 ? 'FINISHED' : 'READY';
      default:
        return 'READY';
    }
  };

  return (
    <Animated.View style={[styles.container, style, { opacity: flashAnimation }]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            <Text style={styles.timeText}>
              {formatTime(timer.remainingTime)}
            </Text>
            <Text style={styles.nameText} numberOfLines={1}>
              {timer.name.toUpperCase()}
            </Text>
            <Text style={styles.stateText}>
              {getStateText()}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  touchable: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    minHeight: 90,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'System',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  stateText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default memo(TimerCard);