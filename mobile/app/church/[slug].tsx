import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { ChurchHomeData } from '@ska/shared';
import { apiClient } from '@/lib/api';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { formatDate } from '@ska/shared';

export default function ChurchHomeScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  // TODO: Get actual userId from auth context
  const userId = 1; // Placeholder

  const { data, isLoading, error, refetch, isRefetching } = useQuery<ChurchHomeData>({
    queryKey: ['church-home', slug, userId],
    queryFn: async () => {
      // First get church by slug
      const churchResponse = await apiClient.get<{ church: any }>(`/churches/${slug}`);
      const churchId = churchResponse.church.id;
      
      // Then get church home data
      return apiClient.get<ChurchHomeData>(`/churches/${churchId}/home?userId=${userId}`);
    },
    enabled: !!slug,
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
        <Text style={styles.error}>Error loading church</Text>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Church not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: data.church.name }} />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
      >
        {/* Church Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {data.church.logoAsset ? (
              <Image
                source={{ uri: data.church.logoAsset.url }}
                style={styles.logo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <FontAwesome name="church" size={32} color="#007AFF" />
              </View>
            )}
            <Text style={styles.churchName}>{data.church.name}</Text>
            <View style={styles.locationRow}>
              <FontAwesome name="map-marker" size={14} color="#fff" />
              <Text style={styles.location}>
                {data.church.city}, {data.church.country}
              </Text>
            </View>
            <View style={styles.memberBadge}>
              <FontAwesome name="users" size={12} color="#007AFF" />
              <Text style={styles.memberBadgeText}>
                {data.church.memberCount} members
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Today's Devotional from Church */}
          {data.todayDevotional && (
            <TouchableOpacity
              style={styles.devotionalCard}
              onPress={() => {/* Navigate to church devotional */}}
            >
              <View style={styles.cardHeader}>
                <FontAwesome name="book" size={20} color="#007AFF" />
                <Text style={styles.cardHeaderText}>Today's Message</Text>
              </View>
              <Text style={styles.devotionalTitle} numberOfLines={2}>
                {data.todayDevotional.title}
              </Text>
              {data.todayDevotional.author && (
                <Text style={styles.devotionalAuthor}>
                  by {data.todayDevotional.author.name}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* Announcements */}
          {data.announcements && data.announcements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Announcements</Text>
              {data.announcements.map((announcement) => (
                <View
                  key={announcement.id}
                  style={[
                    styles.announcementCard,
                    announcement.priority === 'urgent' && styles.announcementUrgent,
                    announcement.priority === 'high' && styles.announcementHigh,
                  ]}
                >
                  <View style={styles.announcementHeader}>
                    <Text style={styles.announcementTitle}>{announcement.title}</Text>
                    {announcement.priority !== 'normal' && (
                      <View style={[
                        styles.priorityBadge,
                        announcement.priority === 'urgent' && styles.priorityUrgent,
                        announcement.priority === 'high' && styles.priorityHigh,
                      ]}>
                        <Text style={styles.priorityText}>
                          {announcement.priority.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.announcementContent} numberOfLines={3}>
                    {announcement.content}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Upcoming Events */}
          {data.upcomingEvents && data.upcomingEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                <TouchableOpacity onPress={() => {/* Navigate to all events */}}>
                  <Text style={styles.seeAll}>See All →</Text>
                </TouchableOpacity>
              </View>
              {data.upcomingEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => {/* Navigate to event details */}}
                >
                  <View style={styles.eventDate}>
                    <Text style={styles.eventDay}>
                      {new Date(event.eventDate).getDate()}
                    </Text>
                    <Text style={styles.eventMonth}>
                      {new Date(event.eventDate).toLocaleString('default', { month: 'short' })}
                    </Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                    {event.location && (
                      <View style={styles.eventLocationRow}>
                        <FontAwesome name="map-marker" size={12} color="#666" />
                        <Text style={styles.eventLocation} numberOfLines={1}>
                          {event.location}
                        </Text>
                      </View>
                    )}
                    {event.eventTime && (
                      <View style={styles.eventTimeRow}>
                        <FontAwesome name="clock-o" size={12} color="#666" />
                        <Text style={styles.eventTime}>{event.eventTime}</Text>
                      </View>
                    )}
                  </View>
                  <FontAwesome name="chevron-right" size={16} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Active Projects */}
          {data.activeProjects && data.activeProjects.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Projects</Text>
                <TouchableOpacity onPress={() => {/* Navigate to all projects */}}>
                  <Text style={styles.seeAll}>See All →</Text>
                </TouchableOpacity>
              </View>
              {data.activeProjects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => {/* Navigate to project details */}}
                >
                  <Text style={styles.projectTitle} numberOfLines={2}>
                    {project.title}
                  </Text>
                  {project.goalAmount && (
                    <View style={styles.projectProgress}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.min((project.raisedAmount / project.goalAmount) * 100, 100)}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.projectAmount}>
                        {project.currency} {project.raisedAmount.toLocaleString()} of {project.goalAmount.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
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
    backgroundColor: '#007AFF',
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  churchName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  content: {
    padding: 15,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cardHeaderText: {
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
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  announcementCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  announcementUrgent: {
    borderLeftColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  announcementHigh: {
    borderLeftColor: '#FF9500',
    backgroundColor: '#FFF9F0',
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  priorityUrgent: {
    backgroundColor: '#FF3B30',
  },
  priorityHigh: {
    backgroundColor: '#FF9500',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  announcementContent: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventDate: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  eventMonth: {
    fontSize: 11,
    color: '#fff',
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 13,
    color: '#666',
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventTime: {
    fontSize: 13,
    color: '#666',
  },
  projectCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  projectProgress: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  projectAmount: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
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
