import { StyleSheet, Image, useColorScheme as useNativeColorScheme } from 'react-native';
import { View, Text } from './Themed';
import Colors from '@/constants/Colors';

export default function BrandedHeader() {
  const colorScheme = useNativeColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={[styles.textContainer, { backgroundColor: 'transparent' }]}>
        <Text style={styles.churchName}>SKA ZIMBABWE</Text>
        <Text style={styles.subtitle}>Sabbath Keeping Adventist Church</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logo: {
    width: 50,
    height: 50,
  },
  textContainer: {
    flex: 1,
  },
  churchName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
});
