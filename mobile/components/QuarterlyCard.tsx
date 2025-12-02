import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Quarterly, QUARTERLY_KINDS } from '@ska/shared';
import { Link } from 'expo-router';

interface QuarterlyCardProps {
  quarterly: Quarterly;
}

export function QuarterlyCard({ quarterly }: QuarterlyCardProps) {
  return (
    <Link href={`/sabbath-school/${quarterly.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        {quarterly.coverUrl && (
          <Image
            source={{ uri: quarterly.coverUrl }}
            style={styles.cover}
            resizeMode="cover"
          />
        )}
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{QUARTERLY_KINDS[quarterly.kind]}</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {quarterly.title}
          </Text>
          {quarterly.description && (
            <Text style={styles.description} numberOfLines={3}>
              {quarterly.description}
            </Text>
          )}
          <Text style={styles.period}>
            Q{quarterly.quarter} {quarterly.year}
          </Text>
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
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cover: {
    width: 120,
    height: 160,
    backgroundColor: '#e0e0e0',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
    marginBottom: 8,
  },
  period: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
