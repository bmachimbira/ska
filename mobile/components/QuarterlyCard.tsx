import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Quarterly, QUARTERLY_KINDS } from '@ska/shared';
import { Link } from 'expo-router';

interface QuarterlyCardProps {
  quarterly: Quarterly;
}

export function QuarterlyCard({ quarterly }: QuarterlyCardProps) {
  return (
    <Link href={`/quarterly/${quarterly.id}`} asChild>
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
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
  },
  cover: {
    width: 120,
    height: 160,
    backgroundColor: '#e0e0e0',
  },
  content: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
    marginBottom: 8,
  },
  period: {
    fontSize: 12,
    opacity: 0.5,
    fontWeight: '600',
  },
});
