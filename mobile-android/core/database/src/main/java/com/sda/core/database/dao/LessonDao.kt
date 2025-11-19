package com.sda.core.database.dao

import androidx.room.*
import com.sda.core.database.entity.LessonDayEntity
import com.sda.core.database.entity.LessonEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface LessonDao {
    @Query("SELECT * FROM lessons WHERE quarterlyId = :quarterlyId ORDER BY indexInQuarter ASC")
    fun getLessonsByQuarterly(quarterlyId: Long): Flow<List<LessonEntity>>

    @Query("SELECT * FROM lessons WHERE id = :lessonId")
    fun getLesson(lessonId: Long): Flow<LessonEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLesson(lesson: LessonEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLessons(lessons: List<LessonEntity>)

    @Delete
    suspend fun deleteLesson(lesson: LessonEntity)

    @Query("DELETE FROM lessons")
    suspend fun clearAll()
}

@Dao
interface LessonDayDao {
    @Query("SELECT * FROM lesson_days WHERE lessonId = :lessonId ORDER BY dayIndex ASC")
    fun getDaysByLesson(lessonId: Long): Flow<List<LessonDayEntity>>

    @Query("SELECT * FROM lesson_days WHERE id = :dayId")
    fun getLessonDay(dayId: Long): Flow<LessonDayEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLessonDay(day: LessonDayEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLessonDays(days: List<LessonDayEntity>)

    @Delete
    suspend fun deleteLessonDay(day: LessonDayEntity)

    @Query("DELETE FROM lesson_days")
    suspend fun clearAll()
}
