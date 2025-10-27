import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useOnboarding } from '@/hooks/useOnboarding';
import { usePremium } from '@/hooks/usePremium';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { resetOnboarding } = useOnboarding();
  const { isPremium, isLoading, expirationDate, presentPaywall, refreshStatus } = usePremium();

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screens again when you restart the app. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            Alert.alert('Success', 'Onboarding has been reset. Restart the app to see the onboarding screens again.');
          },
        },
      ]
    );
  };

  const handlePremiumAction = async () => {
    if (isPremium) {
      // Show premium status info
      const expirationText = expirationDate 
        ? `Expires: ${new Date(expirationDate).toLocaleDateString()}`
        : 'Active subscription';
      
      Alert.alert(
        'Premium Status',
        `You have premium access!\n\n${expirationText}`,
        [
          {
            text: 'Refresh Status',
            onPress: refreshStatus,
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    } else {
      // Present paywall
      try {
        const purchaseSuccessful = await presentPaywall();
        if (purchaseSuccessful) {
          Alert.alert(
            'Welcome to Premium!',
            'Thank you for upgrading! You now have access to all premium features.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error presenting paywall:', error);
        Alert.alert(
          'Error',
          'Unable to load premium upgrade. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    type = 'default',
    loading = false
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    type?: 'default' | 'premium' | 'destructive' | 'premium-active';
    loading?: boolean;
  }) => {
    const getItemStyle = () => {
      switch (type) {
        case 'premium':
          return { backgroundColor: '#FFD700' + '20', borderColor: '#FFD700' + '40' };
        case 'premium-active':
          return { backgroundColor: '#4CAF50' + '20', borderColor: '#4CAF50' + '40' };
        case 'destructive':
          return { backgroundColor: '#FF6B6B' + '20', borderColor: '#FF6B6B' + '40' };
        default:
          return { backgroundColor: colors.background, borderColor: colors.text + '20' };
      }
    };

    const getTextColor = () => {
      switch (type) {
        case 'premium':
          return '#B8860B';
        case 'premium-active':
          return '#2E7D32';
        case 'destructive':
          return '#D63031';
        default:
          return colors.text;
      }
    };

    return (
      <TouchableOpacity
        style={[styles.settingItem, getItemStyle(), { borderColor: getItemStyle().borderColor }]}
        onPress={onPress}
        disabled={loading}
      >
        <View style={styles.settingItemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
            {loading ? (
              <ActivityIndicator size="small" color={getTextColor()} />
            ) : (
              <IconSymbol name={icon} size={24} color={getTextColor()} />
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.settingTitle, { color: getTextColor() }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.settingSubtitle, { color: colors.text, opacity: 0.6 }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {!loading && <IconSymbol name="chevron.right" size={16} color={colors.text} />}
      </TouchableOpacity>
    );
  };

  const getPremiumItemProps = () => {
    if (isLoading) {
      return {
        icon: 'star.fill',
        title: 'Premium Status',
        subtitle: 'Checking status...',
        type: 'default' as const,
        loading: true,
      };
    }

    if (isPremium) {
      const expirationText = expirationDate 
        ? `Expires ${new Date(expirationDate).toLocaleDateString()}`
        : 'Active subscription';
      
      return {
        icon: 'checkmark.seal.fill',
        title: 'Premium Active',
        subtitle: expirationText,
        type: 'premium-active' as const,
        loading: false,
      };
    }

    return {
      icon: 'star.fill',
      title: 'Upgrade to Premium',
      subtitle: 'Unlock all features and remove ads',
      type: 'premium' as const,
      loading: false,
    };
  };

  const premiumProps = getPremiumItemProps();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.headerSubtitle, { color: colors.text, opacity: 0.6 }]}>
            Customize your app experience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Premium</Text>
          <SettingItem
            icon={premiumProps.icon}
            title={premiumProps.title}
            subtitle={premiumProps.subtitle}
            onPress={handlePremiumAction}
            type={premiumProps.type}
            loading={premiumProps.loading}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
          <SettingItem
            icon="arrow.clockwise"
            title="Reset Onboarding"
            subtitle="Show welcome screens again"
            onPress={handleResetOnboarding}
            type="destructive"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <SettingItem
            icon="info.circle"
            title="App Version"
            subtitle="1.0.0"
            onPress={() => Alert.alert('App Version', 'Version 1.0.0\nBuilt with Expo and React Native')}
          />
          <SettingItem
            icon="questionmark.circle"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => Alert.alert('Help & Support', 'Support functionality will be implemented here.')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
});