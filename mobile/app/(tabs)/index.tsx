import { StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, RefreshControl, useColorScheme as useNativeColorScheme } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { HomePageData } from '@ska/shared';
import { apiClient } from '@/lib/api';
import { useRouter } from 'expo-router';
import { formatDate } from '@ska/shared';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import SermonVideoCarousel from '@/components/SermonVideoCarousel';
import Colors from '@/constants/Colors';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useNativeColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { data, isLoading, error, refetch, isRefetching } = useQuery<HomePageData>({
    queryKey: ['home'],
    queryFn: () => apiClient.get<HomePageData>('/home'),
  });

  // Sort sermons by publishedAt date (most recent first)
  const sortedSermons = data?.recentSermons
    ? [...data.recentSermons].sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt).getTime();
        const dateB = new Date(b.publishedAt || b.createdAt).getTime();
        return dateB - dateA;
      })
    : [];

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
      {/* Reels-style Video Carousel */}
      {sortedSermons.length > 0 && (
        <SermonVideoCarousel sermons={sortedSermons.slice(0, 10)} />
      )}

      <View style={styles.content}>

        {data?.todayDevotional && (
          <View style={[styles.feedCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={[styles.feedCardHeader, { backgroundColor: 'transparent' }]}>
              <View style={[styles.feedCardAvatar, { backgroundColor: colors.primary }]}>
                <FontAwesome name="book" size={20} color="#FFF" />
              </View>
              <View style={{ backgroundColor: 'transparent', flex: 1 }}>
                <Text style={[styles.feedCardTitle, { color: colors.text }]}>Today's Devotional</Text>
                <Text style={[styles.feedCardTime, { color: colors.textSecondary }]}>Daily Inspiration</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/devotional/${data.todayDevotional!.id}`)}
            >
              <Text style={[styles.devotionalTitle, { color: colors.text }]} numberOfLines={2}>
                {data.todayDevotional.title}
              </Text>
              {data.todayDevotional.author && (
                <Text style={[styles.devotionalAuthor, { color: colors.textSecondary }]}>by {data.todayDevotional.author}</Text>
              )}
              {data.todayDevotional.content && (
                <Text style={[styles.devotionalVerse, { color: colors.textSecondary }]} numberOfLines={3}>
                  {data.todayDevotional.content.substring(0, 150)}...
                </Text>
              )}
            </TouchableOpacity>
            <View style={[styles.feedCardActions, { backgroundColor: 'transparent', borderTopColor: colors.border }]}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'transparent' }]}>
                <FontAwesome name="heart-o" size={20} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'transparent' }]}>
                <FontAwesome name="share" size={18} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {data?.nextEvent && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Event</Text>
            </View>
            <TouchableOpacity
              style={styles.eventCard}
              onPress={() => {/* Navigate to event details */}}
            >
              {data.nextEvent.thumbnailAsset && (
                <Image
                  source={{ uri: data.nextEvent.thumbnailAsset.url }}
                  style={styles.eventImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.eventContent}>
                <View style={styles.eventDateBadge}>
                  <FontAwesome name="calendar" size={14} color="#fff" />
                  <Text style={styles.eventDateText}>
                    {formatDate(data.nextEvent.eventDate)}
                  </Text>
                </View>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {data.nextEvent.title}
                </Text>
                {data.nextEvent.location && (
                  <View style={styles.eventLocation}>
                    <FontAwesome name="map-marker" size={14} color="#666" />
                    <Text style={styles.eventLocationText} numberOfLines={1}>
                      {data.nextEvent.location}
                    </Text>
                  </View>
                )}
                {data.nextEvent.speaker && (
                  <Text style={styles.eventSpeaker}>
                    Speaker: {data.nextEvent.speaker.name}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Devotionals</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/devotionals')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.devotionalListCard}
            onPress={() => router.push('/(tabs)/devotionals')}
          >
            <FontAwesome name="book-open" size={24} color="#007AFF" />
            <View style={styles.devotionalListContent}>
              <Text style={styles.devotionalListTitle}>Daily Devotionals</Text>
              <Text style={styles.devotionalListSubtitle}>Read today's message and past devotionals</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        {sortedSermons && sortedSermons.length > 10 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>More Sermons</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/sermons')}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {sortedSermons.slice(10, 15).map((sermon) => (
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
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 12,
    gap: 12,
  },
  // Facebook-style feed card
  feedCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
  },
  feedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  feedCardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  feedCardTime: {
    fontSize: 12,
    marginTop: 2,
  },
  feedCardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  devotionalCard: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  devotionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  devotionalLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  devotionalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 24,
  },
  devotionalAuthor: {
    fontSize: 13,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  devotionalVerse: {
    fontSize: 14,
    lineHeight: 20,
  },
  devotionalListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  devotionalListContent: {
    flex: 1,
  },
  devotionalListTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  devotionalListSubtitle: {
    fontSize: 13,
    opacity: 0.6,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  eventImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e0e0e0',
  },
  eventContent: {
    padding: 20,
  },
  eventDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  eventDateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    color: '#1A1A1A',
    lineHeight: 30,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  eventLocationText: {
    fontSize: 14,
    color: '#666',
  },
  eventSpeaker: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
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
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  seeAll: {
    fontSize: 15,
    color: '#0066CC',
    fontWeight: '700',
  },
  horizontalScroll: {
    marginHorizontal: -15,
    paddingHorizontal: 15,
  },
  miniCard: {
    width: 180,
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
