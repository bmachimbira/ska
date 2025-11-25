package com.sda.feature.quarterlies.data.repository

import com.sda.core.common.result.Result
import com.sda.core.database.dao.LessonDao
import com.sda.core.database.dao.LessonDayDao
import com.sda.core.database.dao.QuarterlyDao
import com.sda.core.database.entity.LessonDayEntity
import com.sda.core.database.entity.LessonEntity
import com.sda.core.database.entity.QuarterlyEntity
import com.sda.core.network.api.SDAApiService
import com.sda.core.network.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for quarterly/lesson data
 */
@Singleton
class QuarterlyRepository @Inject constructor(
    private val apiService: SDAApiService,
    private val quarterlyDao: QuarterlyDao,
    private val lessonDao: LessonDao,
    private val lessonDayDao: LessonDayDao
) {

    /**
     * Get quarterlies by kind (adult, youth, kids)
     */
    fun getQuarterlies(
        kind: String? = null,
        lang: String = "en"
    ): Flow<Result<QuarterlyListResponse>> = flow {
        emit(Result.Loading)

        try {
            val response = apiService.getQuarterlies(kind = kind, lang = lang)

            if (response.isSuccessful) {
                val data = response.body()
                if (data != null) {
                    // Cache quarterlies
                    cacheQuarterlies(data.quarterlies)
                    emit(Result.Success(data))
                } else {
                    emit(Result.Error(Exception("Empty response")))
                }
            } else {
                emit(Result.Error(Exception("Network error: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.Error(e, e.message))
        }
    }

    /**
     * Get lessons for a quarterly
     */
    fun getLessons(quarterlyId: Long): Flow<Result<LessonListResponse>> = flow {
        emit(Result.Loading)

        try {
            val response = apiService.getLessons(quarterlyId)

            if (response.isSuccessful) {
                val data = response.body()
                if (data != null) {
                    // Cache lessons
                    cacheLessons(quarterlyId, data.lessons)
                    emit(Result.Success(data))
                } else {
                    emit(Result.Error(Exception("Empty response")))
                }
            } else {
                emit(Result.Error(Exception("Network error: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.Error(e, e.message))
        }
    }

    /**
     * Get a specific lesson with days
     */
    fun getLesson(lessonId: Long): Flow<Result<LessonResponse>> = flow {
        emit(Result.Loading)

        try {
            val response = apiService.getLesson(lessonId)

            if (response.isSuccessful) {
                val wrapper = response.body()
                if (wrapper != null) {
                    val lesson = wrapper.lesson
                    // Cache lesson
                    cacheLesson(lesson)
                    emit(Result.Success(lesson))
                } else {
                    emit(Result.Error(Exception("Lesson not found")))
                }
            } else {
                emit(Result.Error(Exception("API error: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.Error(e, e.message))
        }
    }

    /**
     * Get a specific lesson day
     */
    fun getLessonDay(lessonId: Long, dayIndex: Int): Flow<Result<LessonDayResponse>> = flow {
        emit(Result.Loading)

        try {
            val response = apiService.getLessonDay(lessonId, dayIndex)

            if (response.isSuccessful) {
                val wrapper = response.body()
                if (wrapper != null) {
                    val day = wrapper.day
                    // Cache lesson day
                    cacheLessonDay(day)
                    emit(Result.Success(day))
                } else {
                    emit(Result.Error(Exception("Lesson day not found")))
                }
            } else {
                emit(Result.Error(Exception("API error: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.Error(e, e.message))
        }
    }

    /**
     * Get cached quarterlies for offline access
     */
    fun getCachedQuarterlies(kind: String): Flow<List<QuarterlyEntity>> {
        return quarterlyDao.getQuarterliesByKind(kind)
    }

    private suspend fun cacheQuarterlies(quarterlies: List<QuarterlySummary>) {
        val entities = quarterlies.map { quarterly ->
            QuarterlyEntity(
                id = quarterly.id,
                kind = quarterly.kind,
                title = quarterly.title,
                description = null,
                year = quarterly.year,
                quarter = quarterly.quarter,
                lang = "en"
            )
        }
        quarterlyDao.insertQuarterlies(entities)
    }

    private suspend fun cacheLessons(quarterlyId: Long, lessons: List<LessonSummary>) {
        val entities = lessons.map { lesson ->
            LessonEntity(
                id = lesson.id,
                quarterlyId = quarterlyId,
                indexInQuarter = lesson.indexInQuarter,
                title = lesson.title,
                description = null
            )
        }
        lessonDao.insertLessons(entities)
    }

    private suspend fun cacheLesson(lesson: LessonResponse) {
        val entity = LessonEntity(
            id = lesson.id,
            quarterlyId = lesson.quarterlyId,
            indexInQuarter = lesson.indexInQuarter,
            title = lesson.title,
            description = lesson.description
        )
        lessonDao.insertLesson(entity)
    }

    private suspend fun cacheLessonDay(day: LessonDayResponse) {
        val entity = LessonDayEntity(
            id = day.id,
            lessonId = day.lessonId,
            dayIndex = day.dayIndex,
            date = day.date,
            title = day.title,
            bodyMd = day.bodyMd,
            memoryVerse = day.memoryVerse,
            audioDownloadUrl = day.audioAsset?.downloadUrl
        )
        lessonDayDao.insertLessonDay(entity)
    }
}
