import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { Lesson, LESSON_DAYS } from '@ska/shared';
import { apiClient } from '@/lib/api';
import { useLocalSearchParams, Stack } from 'expo-router';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: lesson, isLoading, error } = useQuery<Lesson>({
    queryKey: ['lesson', id],
    queryFn: () => apiClient.get<Lesson>(`/sabbath-school/lessons/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Error loading lesson</Text>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: lesson.title || 'Lesson' }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.lessonNumber}>
            <Text style={styles.lessonNumberText}>Lesson {lesson.indexInQuarter}</Text>
          </View>
          <Text style={styles.title}>{lesson.title}</Text>
          {lesson.description && (
            <Text style={styles.description}>{lesson.description}</Text>
          )}
          {lesson.memoryVerse && (
            <View style={styles.verseContainer}>
              <Text style={styles.verseLabel}>Memory Verse</Text>
              <Text style={styles.verse}>{lesson.memoryVerse}</Text>
            </View>
          )}
        </View>

        {lesson.days && lesson.days.length > 0 && (
          <View style={styles.daysContainer}>
            <Text style={styles.sectionTitle}>Daily Studies</Text>
            {lesson.days.map((day) => (
              <View key={day.id} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>
                    {LESSON_DAYS[day.dayIndex] || `Day ${day.dayIndex}`}
                  </Text>
                  {day.date && (
                    <Text style={styles.dayDate}>
                      {new Date(day.date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <Text style={styles.dayTitle}>{day.title}</Text>
                {day.memoryVerse && (
                  <Text style={styles.dayVerse}>{day.memoryVerse}</Text>
                )}
                {day.studyAim && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Study Aim:</Text>
                    <Text style={styles.sectionText}>{day.studyAim}</Text>
                  </View>
                )}
                {day.introduction && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Introduction:</Text>
                    <Text style={styles.sectionText}>{day.introduction}</Text>
                  </View>
                )}
                <Text style={styles.dayContent}>{day.bodyMd}</Text>
                {day.studyHelp && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Study Help:</Text>
                    <Text style={styles.sectionText}>{day.studyHelp}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
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
    padding: 20,
    backgroundColor: '#007AFF',
  },
  lessonNumber: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  lessonNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    color: '#fff',
    fontSize: 15,
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: 15,
  },
  verseContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 15,
    borderRadius: 12,
  },
  verseLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.9,
    marginBottom: 8,
  },
  verse: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  daysContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  dayCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    textTransform: 'uppercase',
  },
  dayDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  dayVerse: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
    marginBottom: 15,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  section: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    opacity: 0.7,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
  dayContent: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.9,
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
