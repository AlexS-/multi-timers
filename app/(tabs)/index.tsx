import TimerGrid from '@/components/TimerGrid';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTimers } from '@/hooks/useTimers';
import { useFonts } from 'expo-font';
import { useKeepAwake } from 'expo-keep-awake';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function HomeScreen() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'settings'>('home');
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const [mainContentWidth, setMainContentWidth] = useState(Dimensions.get('window').width);
  const [fontsLoaded, fontError] = useFonts({
    'Orbitron-Regular': require('@/assets/fonts/Orbitron-Regular.ttf'),
    'Orbitron-Bold': require('@/assets/fonts/Orbitron-Bold.ttf'),
  });
useKeepAwake();

  const { 
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
    canAddTimer 
  } = useTimers();

  const isLandscape = screenDimensions.width > screenDimensions.height;

  const handleResetAllTimers = () => {
    Alert.alert(
      'Reset All Timers',
      'Are you sure you want to reset all timers? This will stop all running timers and reset them to their original duration.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: () => {
            resetAllTimers();
            Alert.alert('Success', 'All timers have been reset.');
          },
        },
      ]
    );
  };

  const handleDeleteAllTimers = () => {
    Alert.alert(
      'Delete All Timers',
      'Are you sure you want to delete all timers? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            // Remove all timers
            timers.forEach(timer => removeTimer(timer.id));
            Alert.alert('Success', 'All timers have been deleted.');
          },
        },
      ]
    );
  };

  const SettingsScreen = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>Settings</Text>
      <Text style={styles.settingsSubtitle}>Timer settings and preferences</Text>
      
      <TouchableOpacity 
        style={styles.resetButton}
        onPress={handleResetAllTimers}
      >
        <IconSymbol name="arrow.clockwise" size={20} color="#FF3B30" />
        <Text style={styles.resetButtonText}>Reset All Timers</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={handleDeleteAllTimers}
      >
        <IconSymbol name="trash" size={20} color="#FF3B30" />
        <Text style={styles.deleteButtonText}>Delete All Timers</Text>
      </TouchableOpacity>
    </View>
  );

  const NavigationButtons = () => (
    <View style={isLandscape ? styles.landscapeNav : styles.portraitNav}>
      <TouchableOpacity
        style={[
          styles.navButton,
          currentScreen === 'home' && styles.activeNavButton
        ]}
        onPress={() => setCurrentScreen('home')}
      >
        <IconSymbol name="house.fill" size={24} color={currentScreen === 'home' ? '#FFD700' : '#FFFFFF'} />
        {!isLandscape && <Text style={styles.navButtonText}>Home</Text>}
      </TouchableOpacity>
      
      {canAddTimer && isLandscape && (
        <TouchableOpacity
          style={styles.navButton}
          onPress={addTimer}
        >
          <IconSymbol name="plus.circle.fill" size={24} color="#007AFF" />
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={[
          styles.navButton,
          currentScreen === 'settings' && styles.activeNavButton
        ]}
        onPress={() => setCurrentScreen('settings')}
      >
        <IconSymbol name="gearshape.fill" size={24} color={currentScreen === 'settings' ? '#FFD700' : '#FFFFFF'} />
        {!isLandscape && <Text style={styles.navButtonText}>Settings</Text>}
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load or timeout after 3 seconds
        const timeout = new Promise(resolve => setTimeout(resolve, 3000));
        await Promise.race([
          new Promise(resolve => {
            if (fontsLoaded || fontError) resolve(true);
          }),
          timeout
        ]);
      } catch (e) {
        console.warn('Font loading error:', e);
      } finally {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  if (!appIsReady) {
    return null;
  }
  return (
    <SafeAreaView style={[styles.container, isLandscape && styles.landscapeSafeArea]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={isLandscape ? styles.landscapeContainer : styles.portraitContainer}>
        {isLandscape && (
          <View style={styles.landscapeNavContainer}>
            <NavigationButtons />
          </View>
        )}
        
        <View 
          style={styles.mainContent}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setMainContentWidth(width);
          }}
        >
          {!isLandscape && (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>FryerTimer</Text>
              <View style={styles.headerRightSection}>
                <NavigationButtons />
                {canAddTimer && (
                   <TouchableOpacity onPress={addTimer} style={styles.addButton}>
                     <IconSymbol name="plus.circle.fill" size={24} color="#007AFF" />
                     <Text style={styles.addButtonText}>Add</Text>
                   </TouchableOpacity>
                 )}
              </View>
            </View>
          )}

          <View style={styles.content}>
            {currentScreen === 'settings' ? (
              <SettingsScreen />
            ) : (
              <>
                {timers.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateTitle}>No Timers Yet</Text>
                    <Text style={styles.emptyStateSubtitle}>
                      Tap "Add Timer" to create your first fryer timer
                    </Text>
                    <TouchableOpacity onPress={addTimer} style={styles.emptyAddButton}>
                      <View style={styles.emptyAddButtonGradient}>
                        <Text style={styles.emptyAddButtonText}>+ Add First Timer</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TimerGrid
                    timers={timers}
                    onToggleTimer={toggleTimer}
                    onResetTimer={resetTimer}
                    onRemoveTimer={removeTimer}
                    onUpdateTimer={updateTimer}
                    formatTime={formatTime}
                    width={mainContentWidth}
                    isLandscape={isLandscape}
                  />
                )}
              </>
            )}
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 0,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  headerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 0, // Remove any default horizontal padding
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: 'System',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyAddButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    minWidth: 200,
    maxWidth: 300,
    height: 56,
    backgroundColor: '#007AFF',
  },
  emptyAddButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAddButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  landscapeNav: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#1a1a1a',
    borderRightWidth: 0,
    borderRightColor: '#333',
    paddingVertical: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  portraitNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  navButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  activeNavButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  settingsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: 'System',
  },
settingsSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'System',
    marginBottom: 32,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    gap: 8,
  },
  resetButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    gap: 8,
    marginTop: 16,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  portraitContainer: {
    flex: 1,
  },
  landscapeNavContainer: {
    width: 80,
    backgroundColor: '#2a2a2a',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  mainContent: {
    flex: 1,
  },
  landscapeSafeArea: {
    paddingRight: 0, // Remove right safe area padding in landscape
  },
});
