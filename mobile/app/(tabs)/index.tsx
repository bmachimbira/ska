import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { HomePageData } from '@ska/shared';
import { apiClient } from '@/lib/api';

export default function HomeScreen() {
  const { data, isLoading, error } = useQuery<HomePageData>({
    queryKey: ['home'],
    queryFn: () => apiClient.get<HomePageData>('/home'),
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Error loading content</Text>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to SKA Zimbabwe</Text>
        <Text style={styles.subtitle}>Zimbabwe Conference of Sabbath Keeping Adventists</Text>

        {data?.featuredSermon && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Sermon</Text>
            <Text style={styles.sermonTitle}>{data.featuredSermon.title}</Text>
            {data.featuredSermon.speaker && (
              <Text style={styles.speaker}>{data.featuredSermon.speaker.name}</Text>
            )}
          </View>
        )}

        {data?.todayDevotional && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Devotional</Text>
            <Text style={styles.devotionalTitle}>{data.todayDevotional.title}</Text>
          </View>
        )}

        {data && data.recentSermons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Sermons</Text>
            <Text style={styles.count}>{data.recentSermons.length} sermons</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },
  section: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  sermonTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  speaker: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
  },
  devotionalTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  count: {
    fontSize: 14,
    opacity: 0.7,
  },
  error: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});
