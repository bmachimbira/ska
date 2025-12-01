import { StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { QuarterliesResponse } from '@ska/shared';
import { apiClient } from '@/lib/api';
import { QuarterlyCard } from '@/components/QuarterlyCard';

export default function SabbathSchoolScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery<QuarterliesResponse>({
    queryKey: ['quarterlies'],
    queryFn: () => apiClient.get<QuarterliesResponse>('/sabbath-school/quarterlies'),
  });

  if (isLoading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Error loading quarterlies</Text>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.quarterlies || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <QuarterlyCard quarterly={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Sabbath School</Text>
            <Text style={styles.subtitle}>Study the quarterly lessons</Text>
            {data?.quarterlies && (
              <Text style={styles.count}>{data.quarterlies.length} quarterlies</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quarterlies available</Text>
          </View>
        }
      />
    </View>
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
  list: {
    padding: 15,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  count: {
    fontSize: 14,
    opacity: 0.6,
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
