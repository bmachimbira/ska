import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
  gradient: string[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to SDA Content',
    description: 'Access sermons, devotionals, and Sabbath School lessons anytime, anywhere.',
    icon: '📖',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    title: 'Daily Devotionals',
    description: 'Start your day with inspiring devotionals delivered fresh every morning.',
    icon: '🌅',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    title: 'Sabbath School',
    description: 'Study quarterly lessons with interactive content and discussion guides.',
    icon: '📚',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    title: 'Video Sermons',
    description: 'Watch powerful sermons from pastors and speakers around the world.',
    icon: '🎥',
    gradient: ['#43e97b', '#38f9d7'],
  },
  {
    title: 'Find Your Church',
    description: 'Connect with your local church community and stay updated with events.',
    icon: '⛪',
    gradient: ['#fa709a', '#fee140'],
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/');
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/');
  };

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <LinearGradient colors={step.gradient} style={styles.container}>
      <View style={styles.content}>
        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
                index < currentStep && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <View style={styles.stepContent}>
          <Text style={styles.icon}>{step.icon}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextText}>
              {isLastStep ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressDotActive: {
    width: 32,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  progressDotCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  stepContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
