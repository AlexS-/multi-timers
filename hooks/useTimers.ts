import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TimerState = 'idle' | 'running' | 'paused';

export interface Timer {
  id: string;
  name: string;
  duration: number; // in seconds
  remainingTime: number; // in seconds
  state: TimerState;
  lastUpdated: number; // timestamp
}

const STORAGE_KEY = 'fryer_timers';
const MAX_TIMERS = 6;

export const useTimers = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const intervalRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Load timers from AsyncStorage on mount
  useEffect(() => {
    loadTimers();
  }, []);

  // Save timers to AsyncStorage whenever timers change
  useEffect(() => {
    if (timers.length > 0) {
      saveTimers();
    }
  }, [timers]);

  // Update running timers every second
  useEffect(() => {
    const updateRunningTimers = () => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (timer.state === 'running' && timer.remainingTime > 0) {
            const now = Date.now();
            const elapsed = Math.floor((now - timer.lastUpdated) / 1000);
            const newRemainingTime = Math.max(0, timer.remainingTime - elapsed);
            
            return {
              ...timer,
              remainingTime: newRemainingTime,
              lastUpdated: now,
              state: (newRemainingTime === 0 ? 'idle' : 'running') as TimerState
            };
          }
          return timer;
        })
      );
    };

    const interval = setInterval(updateRunningTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadTimers = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedTimers: Timer[] = JSON.parse(stored);
        // Adjust remaining time based on time elapsed since last save
        const now = Date.now();
        const adjustedTimers = parsedTimers.map(timer => {
          if (timer.state === 'running') {
            const elapsed = Math.floor((now - timer.lastUpdated) / 1000);
            const newRemainingTime = Math.max(0, timer.remainingTime - elapsed);
            return {
              ...timer,
              remainingTime: newRemainingTime,
              lastUpdated: now,
              state: (newRemainingTime === 0 ? 'idle' : 'running') as TimerState
            };
          }
          return timer;
        });
        setTimers(adjustedTimers);
      }
    } catch (error) {
      console.error('Error loading timers:', error);
    }
  };

  const saveTimers = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch (error) {
      console.error('Error saving timers:', error);
    }
  };

  const addTimer = useCallback(() => {
    if (timers.length >= MAX_TIMERS) return;

    const newTimer: Timer = {
      id: Date.now().toString(),
      name: `Timer ${timers.length + 1}`,
      duration: 300, // 5 minutes default
      remainingTime: 300,
      state: 'idle',
      lastUpdated: Date.now()
    };

    setTimers(prev => [...prev, newTimer]);
  }, [timers.length]);

  const removeTimer = useCallback((id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
    // Clear any running interval for this timer
    if (intervalRefs.current[id]) {
      clearInterval(intervalRefs.current[id]);
      delete intervalRefs.current[id];
    }
  }, []);

  const startTimer = useCallback((id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, state: 'running', lastUpdated: Date.now() }
          : timer
      )
    );
  }, []);

  const pauseTimer = useCallback((id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, state: 'paused', lastUpdated: Date.now() }
          : timer
      )
    );
  }, []);

  const resetTimer = useCallback((id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { 
              ...timer, 
              remainingTime: timer.duration, 
              state: 'idle',
              lastUpdated: Date.now()
            }
          : timer
      )
    );
  }, []);

  const resetAllTimers = useCallback(() => {
    setTimers(prev => 
      prev.map(timer => ({
        ...timer,
        remainingTime: timer.duration,
        state: 'idle' as TimerState,
        lastUpdated: Date.now()
      }))
    );
  }, []);

  const updateTimer = useCallback((id: string, updates: Partial<Pick<Timer, 'name' | 'duration'>>) => {
    setTimers(prev => 
      prev.map(timer => {
        if (timer.id === id) {
          const updatedTimer = { ...timer, ...updates, lastUpdated: Date.now() };
          // If duration changed and timer is idle, update remaining time too
          if (updates.duration !== undefined && timer.state === 'idle') {
            updatedTimer.remainingTime = updates.duration;
          }
          return updatedTimer;
        }
        return timer;
      })
    );
  }, []);

  const toggleTimer = useCallback((id: string) => {
    const timer = timers.find(t => t.id === id);
    if (!timer) return;

    if (timer.state === 'running') {
      pauseTimer(id);
    } else if (timer.state === 'paused' || timer.state === 'idle') {
      if (timer.remainingTime > 0) {
        startTimer(id);
      }
    }
  }, [timers, startTimer, pauseTimer]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timers,
    addTimer,
    removeTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    resetAllTimers,
    updateTimer,
    toggleTimer,
    formatTime,
    canAddTimer: timers.length < MAX_TIMERS
  };
};