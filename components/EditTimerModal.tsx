import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Timer } from '../hooks/useTimers';

interface EditTimerModalProps {
  visible: boolean;
  timer: Timer | null;
  onSave: (id: string, updates: { name: string; duration: number }) => void;
  onClose: () => void;
}

const EditTimerModal: React.FC<EditTimerModalProps> = ({
  visible,
  timer,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');

  useEffect(() => {
    if (timer) {
      setName(timer.name);
      const totalSeconds = timer.duration;
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      setMinutes(mins.toString());
      setSeconds(secs.toString());
    }
  }, [timer]);

  const handleSave = () => {
    if (!timer) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Timer name cannot be empty');
      return;
    }

    const mins = parseInt(minutes) || 0;
    const secs = parseInt(seconds) || 0;

    if (mins < 0 || mins > 99) {
      Alert.alert('Error', 'Minutes must be between 0 and 99');
      return;
    }

    if (secs < 0 || secs > 59) {
      Alert.alert('Error', 'Seconds must be between 0 and 59');
      return;
    }

    const totalDuration = mins * 60 + secs;
    if (totalDuration === 0) {
      Alert.alert('Error', 'Timer duration must be greater than 0');
      return;
    }

    onSave(timer.id, {
      name: trimmedName,
      duration: totalDuration,
    });

    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!timer) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Edit Timer</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.label}>Timer Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter timer name"
                maxLength={20}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.timeInputContainer}>
                <View style={styles.timeInputGroup}>
                  <TextInput
                    style={styles.timeInput}
                    value={minutes}
                    onChangeText={(text) => {
                      const filtered = text.replace(/[^0-9]/g, '');
                      if (filtered.length <= 2) {
                        setMinutes(filtered);
                      }
                    }}
                    placeholder="00"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.timeLabel}>min</Text>
                </View>

                <Text style={styles.timeSeparator}>:</Text>

                <View style={styles.timeInputGroup}>
                  <TextInput
                    style={styles.timeInput}
                    value={seconds}
                    onChangeText={(text) => {
                      const filtered = text.replace(/[^0-9]/g, '');
                      if (filtered.length <= 2) {
                        const num = parseInt(filtered) || 0;
                        if (num <= 59) {
                          setSeconds(filtered);
                        }
                      }
                    }}
                    placeholder="00"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.timeLabel}>sec</Text>
                </View>
              </View>
            </View>

            <View style={styles.presetSection}>
              <Text style={styles.label}>Quick Presets</Text>
              <View style={styles.presetButtons}>
                {[
                  { label: '1 min', value: 60 },
                  { label: '3 min', value: 180 },
                  { label: '5 min', value: 300 },
                  { label: '10 min', value: 600 },
                  { label: '15 min', value: 900 },
                  { label: '30 min', value: 1800 },
                ].map((preset) => (
                  <TouchableOpacity
                    key={preset.value}
                    style={styles.presetButton}
                    onPress={() => {
                      const mins = Math.floor(preset.value / 60);
                      const secs = preset.value % 60;
                      setMinutes(mins.toString());
                      setSeconds(secs.toString());
                    }}
                  >
                    <Text style={styles.presetButtonText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: 80,
    fontFamily: 'System',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 12,
    color: '#333',
  },
  presetSection: {
    marginTop: 12,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
  },
  presetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default EditTimerModal;