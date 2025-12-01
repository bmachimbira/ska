import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Devotional } from '@ska/shared';
import { Link } from 'expo-router';
import { formatDate } from '@ska/shared';

interface DevotionalCardProps {
  devotional: Devotional;
}

export function DevotionalCard({ devotional }: DevotionalCardProps) {
  return (
    <Link href={`/devotional/${devotional.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {formatDate(devotional.date)}
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {devotional.title}
          </Text>
          {devotional.author && (
            <Text style={styles.author}>by {devotional.author}</Text>
          )}
          <Text style={styles.verse} numberOfLines={2}>
            {devotional.memoryVerse}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.views}>{devotional.viewCount} views</Text>
            {devotional.audioAsset && (
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
  dateContainer: {
    backgroundColor: '#007AFF',
    padding: 12,
  },
  dateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  author: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  verse: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 20,
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
    backgroundColor: '#34C759',
    color: '#fff',
    borderRadius: 4,
    overflow: 'hidden',
  },
});
