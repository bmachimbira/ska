import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { LessonDay, LESSON_DAYS } from '@ska/shared';
import { apiClient } from '@/lib/api';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LessonDayScreen() {
  const { id, dayIndex } = useLocalSearchParams<{ id: string; dayIndex: string }>();
  const router = useRouter();
  const currentDayIndex = parseInt(dayIndex || '1');

  const { data: dayResponse, isLoading, error } = useQuery<{ day: LessonDay & { lesson: any; quarterly: any } }>({
    queryKey: ['lesson-day', id, dayIndex],
    queryFn: () => apiClient.get<{ day: LessonDay & { lesson: any; quarterly: any } }>(`/lessons/${id}/days/${dayIndex}`),
    enabled: !!id && !!dayIndex,
  });

  const day = dayResponse?.day;

  const canGoPrevious = currentDayIndex > 1;
  const canGoNext = currentDayIndex < 7;

  const handlePrevious = () => {
    if (canGoPrevious) {
      router.push(`/lesson/${id}/day/${currentDayIndex - 1}`);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      router.push(`/lesson/${id}/day/${currentDayIndex + 1}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !day) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Error loading lesson day</Text>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: day.lesson?.title || 'Lesson' }} />
      <ScrollView style={styles.container}>
        {/* Lesson Context */}
        <View style={styles.header}>
          <View style={styles.lessonNumber}>
            <Text style={styles.lessonNumberText}>
              Lesson {day.lesson?.indexInQuarter}
            </Text>
          </View>
          <Text style={styles.lessonTitle}>{day.lesson?.title}</Text>
        </View>

        {/* Day Card */}
        <View style={styles.dayCard}>
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
            <View style={styles.verseContainer}>
              <Text style={styles.verseLabel}>Memory Verse</Text>
              <Text style={styles.verse}>{day.memoryVerse}</Text>
            </View>
          )}

          {day.studyAim && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Study Aim</Text>
              <Text style={styles.sectionText}>{day.studyAim}</Text>
            </View>
          )}

          {day.introduction && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Introduction</Text>
              <Text style={styles.sectionText}>{day.introduction}</Text>
            </View>
          )}

          {day.bodyMd && (
            <View style={styles.contentSection}>
              <Text style={styles.content}>{day.bodyMd}</Text>
            </View>
          )}

          {day.studyHelp && (
            <View style={styles.helpSection}>
              <Text style={styles.sectionLabel}>Study Help</Text>
              <Text style={styles.sectionText}>{day.studyHelp}</Text>
            </View>
          )}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={!canGoPrevious}>
            <Ionicons name="chevron-back" size={20} color={canGoPrevious ? '#007AFF' : '#ccc'} />
            <Text style={[styles.navButtonText, !canGoPrevious && styles.navButtonTextDisabled]}>
              Previous Day
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={!canGoNext}>
            <Text style={[styles.navButtonText, !canGoNext && styles.navButtonTextDisabled]}>
              Next Day
            </Text>
            <Ionicons name="chevron-forward" size={20} color={canGoNext ? '#007AFF' : '#ccc'} />
          </TouchableOpacity>
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
    padding: 20,
    backgroundColor: '#007AFF',
  },
  lessonNumber: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  lessonNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  lessonTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dayCard: {
    padding: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    textTransform: 'uppercase',
  },
  dayDate: {
    fontSize: 13,
    opacity: 0.6,
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  verseContainer: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  verseLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#007AFF',
    marginBottom: 8,
  },
  verse: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#007AFF',
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.9,
  },
  contentSection: {
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 26,
    opacity: 0.9,
  },
  helpSection: {
    backgroundColor: '#F1F8E9',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  navButtonTextDisabled: {
    color: '#999',
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
