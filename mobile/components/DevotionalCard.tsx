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
  dateContainer: {
    backgroundColor: '#0066CC',
    padding: 14,
  },
  dateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
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
  author: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  verse: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 21,
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
