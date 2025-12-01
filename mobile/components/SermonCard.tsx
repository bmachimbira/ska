import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Sermon } from '@ska/shared';
import { Link } from 'expo-router';
import { formatDate } from '@ska/shared';

interface SermonCardProps {
  sermon: Sermon;
}

export function SermonCard({ sermon }: SermonCardProps) {
  return (
    <Link href={`/sermon/${sermon.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        {sermon.thumbnailAsset && (
          <Image
            source={{ uri: sermon.thumbnailAsset.url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {sermon.title}
          </Text>
          {sermon.speaker && (
            <Text style={styles.speaker}>{sermon.speaker.name}</Text>
          )}
          {sermon.series && (
            <Text style={styles.series}>{sermon.series.title}</Text>
          )}
          {sermon.publishedAt && (
            <Text style={styles.date}>
              {formatDate(sermon.publishedAt)}
            </Text>
          )}
          <View style={styles.footer}>
            <Text style={styles.views}>{sermon.viewCount} views</Text>
            {sermon.videoAsset && (
              <Text style={styles.badge}>Video</Text>
            )}
            {sermon.audioAsset && !sermon.videoAsset && (
              <Text style={styles.badge}>Audio</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  speaker: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  series: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  views: {
    fontSize: 12,
    opacity: 0.5,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#007AFF',
    color: '#fff',
    borderRadius: 4,
    overflow: 'hidden',
  },
});
