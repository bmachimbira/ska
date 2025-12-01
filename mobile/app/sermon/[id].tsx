import { StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { Sermon } from '@ska/shared';
import { apiClient } from '@/lib/api';
import { useLocalSearchParams, Stack } from 'expo-router';
import { formatDate } from '@ska/shared';
import { Video, ResizeMode } from 'expo-av';
import { useState, useRef } from 'react';

const { width } = Dimensions.get('window');

export default function SermonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const videoRef = useRef<Video>(null);
  const [videoStatus, setVideoStatus] = useState<any>({});

  const { data: sermon, isLoading, error } = useQuery<Sermon>({
    queryKey: ['sermon', id],
    queryFn: () => apiClient.get<Sermon>(`/sermons/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !sermon) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Error loading sermon</Text>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: sermon.title || 'Sermon' }} />
      <ScrollView style={styles.container}>
        {sermon.videoAsset && (
          <Video
            ref={videoRef}
            source={{ uri: sermon.videoAsset.url }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={setVideoStatus}
          />
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{sermon.title}</Text>

          {sermon.speaker && (
            <View style={styles.metaRow}>
              <Text style={styles.label}>Speaker:</Text>
              <Text style={styles.value}>{sermon.speaker.name}</Text>
            </View>
          )}

          {sermon.series && (
            <View style={styles.metaRow}>
              <Text style={styles.label}>Series:</Text>
              <Text style={styles.value}>{sermon.series.title}</Text>
            </View>
          )}

          {sermon.publishedAt && (
            <View style={styles.metaRow}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{formatDate(sermon.publishedAt)}</Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.label}>Views:</Text>
            <Text style={styles.value}>{sermon.viewCount}</Text>
          </View>

          {sermon.tags && sermon.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {sermon.tags.map((tag) => (
                <View key={tag.id} style={styles.tag}>
                  <Text style={styles.tagText}>{tag.name}</Text>
                </View>
              ))}
            </View>
          )}

          {sermon.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{sermon.description}</Text>
            </View>
          )}

          {sermon.scriptureRefs && sermon.scriptureRefs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Scripture References</Text>
              {sermon.scriptureRefs.map((ref, index) => (
                <Text key={index} style={styles.scripture}>
                  • {ref}
                </Text>
              ))}
            </View>
          )}

          {sermon.transcript && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transcript</Text>
              <Text style={styles.transcript}>{sermon.transcript}</Text>
            </View>
          )}

          {!sermon.videoAsset && sermon.audioAsset && (
            <View style={styles.audioContainer}>
              <Text style={styles.audioText}>Audio playback coming soon</Text>
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
  video: {
    width: width,
    height: width * (9 / 16),
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    width: 80,
    opacity: 0.7,
  },
  value: {
    fontSize: 14,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    marginBottom: 15,
  },
  tag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  scripture: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
    marginBottom: 5,
  },
  transcript: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.7,
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
