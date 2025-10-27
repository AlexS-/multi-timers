import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const { width, height } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingProps> = ({ onComplete }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const pages = [
    {
      backgroundColor: colors.background,
      image: (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🚀</Text>
        </View>
      ),
      title: 'Welcome to Our App',
      subtitle: 'Discover amazing features and possibilities that await you in this incredible journey.',
      titleStyles: { color: colors.text, fontSize: 28, fontWeight: 'bold' },
      subTitleStyles: { color: colors.text, fontSize: 16, opacity: 0.8, textAlign: 'center', lineHeight: 24 },
    },
    {
      backgroundColor: colors.background,
      image: (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✨</Text>
        </View>
      ),
      title: 'Easy to Use',
      subtitle: 'Our intuitive interface makes it simple to navigate and accomplish your goals effortlessly.',
      titleStyles: { color: colors.text, fontSize: 28, fontWeight: 'bold' },
      subTitleStyles: { color: colors.text, fontSize: 16, opacity: 0.8, textAlign: 'center', lineHeight: 24 },
    },
    {
      backgroundColor: colors.background,
      image: (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎯</Text>
        </View>
      ),
      title: 'Get Started',
      subtitle: "You're all set! Let's begin this amazing experience together and unlock your potential.",
      titleStyles: { color: colors.text, fontSize: 28, fontWeight: 'bold' },
      subTitleStyles: { color: colors.text, fontSize: 16, opacity: 0.8, textAlign: 'center', lineHeight: 24 },
    },
  ];

  return (
    <Onboarding
      pages={pages}
      onDone={onComplete}
      onSkip={onComplete}
      showSkip={true}
      skipLabel="Skip"
      nextLabel="Next"
      doneLabel="Get Started"
      dotStyle={{
        backgroundColor: colors.text + '30',
        width: 8,
        height: 8,
      }}
      selectedDotStyle={{
        backgroundColor: colors.tint,
        width: 20,
        height: 8,
      }}
      skipToPage={2}
      controlStatusBar={false}
      allowFontScaling={false}
      pageIndexCallback={(index) => {
        // Optional: track which page user is on
        console.log('Current page:', index);
      }}
      titleStyles={{
        color: colors.text,
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
      }}
      subTitleStyles={{
        color: colors.text,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.8,
        paddingHorizontal: 40,
      }}
      bottomBarHighlight={false}
      bottomBarHeight={100}
      containerStyles={{
        paddingHorizontal: 20,
      }}
    />
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 80,
  },
});

export default OnboardingScreen;