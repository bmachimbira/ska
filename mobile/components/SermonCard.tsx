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
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1A1A1A',
    lineHeight: 26,
  },
  speaker: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
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
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#0066CC',
    color: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
