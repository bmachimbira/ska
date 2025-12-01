import { StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { HomePageData } from '@ska/shared';
import { apiClient } from '@/lib/api';
import { useRouter } from 'expo-router';
import { formatDate } from '@ska/shared';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useQuery<HomePageData>({
    queryKey: ['home'],
    queryFn: () => apiClient.get<HomePageData>('/home'),
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
        <Text style={styles.error}>Error loading content</Text>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Welcome to</Text>
        <Text style={styles.heroSubtitle}>SKA Zimbabwe</Text>
        <Text style={styles.heroText}>Zimbabwe Conference of Sabbath Keeping Adventists</Text>
      </View>

      <View style={styles.content}>
        {data?.featuredSermon && (
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => router.push(`/sermon/${data.featuredSermon!.id}`)}
          >
            {data.featuredSermon.thumbnailAsset && (
              <Image
                source={{ uri: data.featuredSermon.thumbnailAsset.url }}
                style={styles.featuredImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.featuredOverlay}>
              <View style={styles.featuredBadge}>
                <FontAwesome name="star" size={12} color="#fff" />
                <Text style={styles.featuredBadgeText}>Featured Sermon</Text>
              </View>
            </View>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle} numberOfLines={2}>
                {data.featuredSermon.title}
              </Text>
              {data.featuredSermon.speaker && (
                <Text style={styles.featuredSpeaker}>{data.featuredSermon.speaker.name}</Text>
              )}
              {data.featuredSermon.publishedAt && (
                <Text style={styles.featuredDate}>{formatDate(data.featuredSermon.publishedAt)}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {data?.todayDevotional && (
          <TouchableOpacity
            style={styles.devotionalCard}
            onPress={() => router.push(`/devotional/${data.todayDevotional!.id}`)}
          >
            <View style={styles.devotionalHeader}>
              <FontAwesome name="book" size={20} color="#007AFF" />
              <Text style={styles.devotionalLabel}>Today's Devotional</Text>
            </View>
            <Text style={styles.devotionalTitle} numberOfLines={2}>
              {data.todayDevotional.title}
            </Text>
            {data.todayDevotional.author && (
              <Text style={styles.devotionalAuthor}>by {data.todayDevotional.author}</Text>
            )}
            <Text style={styles.devotionalVerse} numberOfLines={2}>
              {data.todayDevotional.memoryVerse}
            </Text>
          </TouchableOpacity>
        )}

        {data?.recentSermons && data.recentSermons.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Sermons</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/sermons')}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {data.recentSermons.slice(0, 5).map((sermon) => (
                <TouchableOpacity
                  key={sermon.id}
                  style={styles.miniCard}
                  onPress={() => router.push(`/sermon/${sermon.id}`)}
                >
                  {sermon.thumbnailAsset && (
                    <Image
                      source={{ uri: sermon.thumbnailAsset.url }}
                      style={styles.miniImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.miniContent}>
                    <Text style={styles.miniTitle} numberOfLines={2}>
                      {sermon.title}
                    </Text>
                    {sermon.speaker && (
                      <Text style={styles.miniSpeaker} numberOfLines={1}>
                        {sermon.speaker.name}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {data?.currentQuarterlies && data.currentQuarterlies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Current Quarterlies</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/sabbath-school')}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtitle}>Study the quarterly lessons</Text>
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
  hero: {
    backgroundColor: '#007AFF',
    padding: 30,
    paddingTop: 40,
    paddingBottom: 40,
  },
  heroTitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  heroSubtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
    marginBottom: 10,
  },
  heroText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  content: {
    padding: 15,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  featuredImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#e0e0e0',
  },
  featuredOverlay: {
    position: 'absolute',
    top: 15,
    left: 15,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  featuredContent: {
    padding: 20,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuredSpeaker: {
    fontSize: 15,
    opacity: 0.7,
    marginBottom: 4,
  },
  featuredDate: {
    fontSize: 13,
    opacity: 0.5,
  },
  devotionalCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  devotionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  devotionalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  devotionalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  devotionalAuthor: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  devotionalVerse: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  horizontalScroll: {
    marginHorizontal: -15,
    paddingHorizontal: 15,
  },
  miniCard: {
    width: 180,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  miniImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0',
  },
  miniContent: {
    padding: 12,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  miniSpeaker: {
    fontSize: 12,
    opacity: 0.6,
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
