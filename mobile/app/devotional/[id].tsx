import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { Devotional } from '@ska/shared';
import { apiClient } from '@/lib/api';
import { useLocalSearchParams, Stack } from 'expo-router';
import { formatDate } from '@ska/shared';

export default function DevotionalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: devotional, isLoading, error } = useQuery<Devotional>({
    queryKey: ['devotional', id],
    queryFn: () => apiClient.get<Devotional>(`/devotionals/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !devotional) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Error loading devotional</Text>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: devotional.title || 'Devotional' }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate(devotional.date)}</Text>
          <Text style={styles.title}>{devotional.title}</Text>
          {devotional.author && (
            <Text style={styles.author}>by {devotional.author}</Text>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.verseContainer}>
            <Text style={styles.verseLabel}>Memory Verse</Text>
            <Text style={styles.verse}>{devotional.memoryVerse}</Text>
          </View>

          <View style={styles.bodyContainer}>
            <Text style={styles.body}>{devotional.content}</Text>
          </View>

          {devotional.audioAsset && (
            <View style={styles.audioContainer}>
              <Text style={styles.audioText}>Audio playback coming soon</Text>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.views}>{devotional.viewCount} views</Text>
          </View>
        </View>
      </ScrollView>
    </>
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
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  date: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.9,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  author: {
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  verseContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  verseLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.6,
    marginBottom: 8,
  },
  verse: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  bodyContainer: {
    marginBottom: 20,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    opacity: 0.9,
  },
  audioContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    alignItems: 'center',
  },
  audioText: {
    fontSize: 14,
    opacity: 0.6,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  views: {
    fontSize: 12,
    opacity: 0.5,
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
