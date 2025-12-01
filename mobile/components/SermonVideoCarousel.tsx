import React from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/components/Themed';
import { Sermon } from '@ska/shared';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const CARD_WIDTH = 140;
const CARD_HEIGHT = 220;

interface SermonVideoCarouselProps {
  sermons: Sermon[];
}

export default function SermonVideoCarousel({ sermons }: SermonVideoCarouselProps) {
  const router = useRouter();

  const renderSermonCard = (sermon: Sermon, index: number) => (
    <TouchableOpacity
      key={sermon.id}
      style={[styles.reelCard, index === 0 && styles.firstCard]}
      onPress={() => router.push(`/sermon/${sermon.id}`)}
      activeOpacity={0.9}
    >
      <View style={styles.reelContainer}>
        {/* Thumbnail */}
        {sermon.thumbnailAsset ? (
          <Image
            source={{ uri: sermon.thumbnailAsset.url }}
            style={styles.reelThumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.reelThumbnail, styles.placeholderThumbnail]}>
            <FontAwesome name="video-camera" size={32} color="#ccc" />
          </View>
        )}

        {/* Play button overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <FontAwesome name="play" size={16} color="#fff" />
          </View>
        </View>

        {/* Gradient overlay */}
        <View style={styles.gradientOverlay} />

        {/* Content at bottom */}
        <View style={styles.reelContent}>
          <Text style={styles.reelTitle} numberOfLines={2}>
            {sermon.title}
          </Text>
          {sermon.speaker && (
            <Text style={styles.reelSpeaker} numberOfLines={1}>
              {sermon.speaker.name}
            </Text>
          )}
        </View>

        {/* Latest badge for first item */}
        {index === 0 && (
          <View style={styles.latestBadge}>
            <Text style={styles.latestText}>NEW</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (sermons.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome name="video-camera" size={20} color="#007AFF" />
        <Text style={styles.headerTitle}>Latest Sermons</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12}
      >
        {sermons.map((sermon, index) => renderSermonCard(sermon, index))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  reelCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: 12,
  },
  firstCard: {
    marginLeft: 0,
  },
  reelContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reelThumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  reelContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  reelTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    lineHeight: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  reelSpeaker: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.85,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  latestBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  latestText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
