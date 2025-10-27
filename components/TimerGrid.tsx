import React, { memo, useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Timer } from '../hooks/useTimers';
import EditTimerModal from './EditTimerModal';
import TimerCard from './TimerCard';

interface TimerGridProps {
  timers: Timer[];
  onToggleTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
  onRemoveTimer: (id: string) => void;
  onUpdateTimer: (id: string, updates: { name: string; duration: number }) => void;
  formatTime: (seconds: number) => string;
  width?: number;
  isLandscape?: boolean;
}

const TimerGrid: React.FC<TimerGridProps> = ({
  timers,
  onToggleTimer,
  onResetTimer,
  onRemoveTimer,
  onUpdateTimer,
  formatTime,
  width: propWidth,
  isLandscape: propIsLandscape,
}) => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [editingTimer, setEditingTimer] = useState<Timer | null>(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width: screenWidth, height } = screenData;
  const width = propWidth || screenWidth;
  const isLandscape = propIsLandscape !== undefined ? propIsLandscape : screenWidth > height;

  // Calculate grid layout based on number of timers and orientation
  const getGridLayout = () => {
    const timerCount = timers.length;
    
    if (timerCount === 0) return { columns: 1, rows: 1 };
    if (timerCount === 1) return { columns: 1, rows: 1 };
    
    if (isLandscape) {
      // Landscape: prefer horizontal layout
      if (timerCount <= 2) return { columns: 2, rows: 1 };
      if (timerCount <= 4) return { columns: 2, rows: 2 };
      if (timerCount <= 6) return { columns: 3, rows: 2 };
    } else {
      // Portrait: prefer vertical layout
      if (timerCount <= 2) return { columns: 1, rows: 2 };
      if (timerCount <= 4) return { columns: 2, rows: 2 };
      if (timerCount <= 6) return { columns: 2, rows: 3 };
    }
    
    return { columns: 3, rows: 2 }; // Max layout
  };

  const { columns, rows } = getGridLayout();

  // Calculate card dimensions with optimized padding and spacing
  const padding = isLandscape ? 0 : 12; // No padding for landscape to maximize width
  const gap = isLandscape ? 8 : 10; // Slightly increased gap for landscape for better spacing
  
  // No need to account for navigation sidebar here since parent container handles it with marginLeft
  const availableWidth = width - (padding * 2);
  
  // More accurate height calculation accounting for header and safe areas
   const headerHeight = isLandscape ? 0 : 70; // No header in landscape mode
   const safeAreaBottom = 34; // Approximate safe area bottom
   const navigationHeight = isLandscape ? 0 : 40; // Navigation buttons in portrait
   const reservedSpace = headerHeight + safeAreaBottom + navigationHeight + (padding * 2);
   const availableHeight = height - reservedSpace;

   const cardWidth = (availableWidth - (gap * (columns - 1))) / columns;
   // Reduced minimum height for portrait to fit 6 timers better
   const minCardHeight = isLandscape ? 100 : 90;
   const cardHeight = Math.max(minCardHeight, (availableHeight - (gap * (rows - 1))) / rows);

  const handleEditTimer = (timer: Timer) => {
    setEditingTimer(timer);
  };

  const handleSaveTimer = (id: string, updates: { name: string; duration: number }) => {
    onUpdateTimer(id, updates);
    setEditingTimer(null);
  };

  const handleCloseModal = () => {
    setEditingTimer(null);
  };

  const renderTimerGrid = () => {
    const gridItems = [];
    
    for (let row = 0; row < rows; row++) {
      const rowItems = [];
      
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        const timer = timers[index];
        
        if (timer) {
          rowItems.push(
            <TimerCard
              key={timer.id}
              timer={timer}
              onToggle={onToggleTimer}
              onEdit={handleEditTimer}
              onReset={onResetTimer}
              onRemove={onRemoveTimer}
              formatTime={formatTime}
              style={{
                width: cardWidth,
                height: cardHeight,
              }}
            />
          );
        } else {
          // Empty placeholder to maintain grid structure
          rowItems.push(
            <View
              key={`empty-${row}-${col}`}
              style={{
                width: cardWidth,
                height: cardHeight,
              }}
            />
          );
        }
      }
      
      gridItems.push(
        <View key={`row-${row}`} style={styles.row}>
          {rowItems.map((item, index) => (
            <React.Fragment key={index}>
              {item}
              {index < rowItems.length - 1 && <View style={{ width: gap }} />}
            </React.Fragment>
          ))}
        </View>
      );
    }
    
    return gridItems;
  };

  return (
    <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingHorizontal: padding,
            paddingVertical: padding / 2,
            minHeight: availableHeight
          }
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.grid}>
          {renderTimerGrid().map((row, index) => (
            <React.Fragment key={index}>
              {row}
              {index < renderTimerGrid().length - 1 && <View style={{ height: gap }} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      <EditTimerModal
        visible={editingTimer !== null}
        timer={editingTimer}
        onSave={handleSaveTimer}
        onClose={handleCloseModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
  },
  landscapeContainer: {
    flex: 1,
    paddingTop: 10,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  grid: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(TimerGrid);