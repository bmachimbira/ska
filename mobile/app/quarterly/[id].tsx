import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { Lesson, QUARTERLY_KINDS } from '@ska/shared';
import { apiClient } from '@/lib/api';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';

export default function QuarterlyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: lessons, isLoading, error } = useQuery<Lesson[]>({
    queryKey: ['quarterly-lessons', id],
    queryFn: () => apiClient.get<Lesson[]>(`/sabbath-school/quarterlies/${id}/lessons`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !lessons) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Error loading lessons</Text>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </View>
    );
  }

  const quarterly = lessons[0]?.quarterly;

  return (
    <>
      <Stack.Screen options={{ title: quarterly?.title || 'Quarterly' }} />
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          quarterly && (
            <View style={styles.header}>
              {quarterly.coverUrl && (
                <Image
                  source={{ uri: quarterly.coverUrl }}
                  style={styles.cover}
                  resizeMode="cover"
                />
              )}
              <View style={styles.headerContent}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{QUARTERLY_KINDS[quarterly.kind]}</Text>
                </View>
                <Text style={styles.title}>{quarterly.title}</Text>
                {quarterly.description && (
                  <Text style={styles.description}>{quarterly.description}</Text>
                )}
                <Text style={styles.period}>
                  Q{quarterly.quarter} {quarterly.year}
                </Text>
              </View>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.lessonCard}
            onPress={() => router.push(`/lesson/${item.id}`)}>
            <View style={styles.lessonNumber}>
              <Text style={styles.lessonNumberText}>{item.indexInQuarter}</Text>
            </View>
            <View style={styles.lessonContent}>
              <Text style={styles.lessonTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.memoryVerse && (
                <Text style={styles.lessonVerse} numberOfLines={2}>
                  {item.memoryVerse}
                </Text>
              )}
              {item.startDate && (
                <Text style={styles.lessonDate}>
                  {new Date(item.startDate).toLocaleDateString()}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No lessons available</Text>
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  cover: {
    width: 200,
    height: 260,
    borderRadius: 12,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    opacity: 0.7,
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  period: {
    fontSize: 14,
    opacity: 0.5,
    fontWeight: '600',
  },
  lessonCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lessonNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  lessonNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  lessonVerse: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  lessonDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
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
