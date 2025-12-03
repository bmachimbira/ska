// Brand colors from SKA Zimbabwe logo
const tintColorLight = '#5B3A9D'; // Purple from logo
const tintColorDark = '#8B7AB8'; // Lighter purple for dark mode
const brandGray = '#8B8B8B'; // Gray from logo

export default {
  light: {
    text: '#1A1A1A',
    background: '#F8F9FA',
    tint: tintColorLight,
    tabIconDefault: brandGray,
    tabIconSelected: tintColorLight,
    cardBackground: '#FFFFFF',
    primary: tintColorLight, // SKA purple
    secondary: '#7C5AB8', // Lighter purple
    accent: brandGray, // SKA gray
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    border: '#E5E7EB',
    textSecondary: '#6B7280',
  },
  dark: {
    text: '#F9FAFB',
    background: '#18181B', // Darker for better contrast
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    cardBackground: '#27272A',
    primary: tintColorDark,
    secondary: '#9B8BC8',
    accent: '#A3A3A3', // Lighter gray for dark mode
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
    border: '#3F3F46',
    textSecondary: '#9CA3AF',
  },
};
