package com.sda.feature.devotionals.data.repository

import com.sda.core.common.result.Result
import com.sda.core.database.dao.DevotionalDao
import com.sda.core.database.entity.DevotionalEntity
import com.sda.core.network.api.SDAApiService
import com.sda.core.network.model.DevotionalListResponse
import com.sda.core.network.model.DevotionalResponse
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for devotional data
 */
@Singleton
class DevotionalRepository @Inject constructor(
    private val apiService: SDAApiService,
    private val devotionalDao: DevotionalDao
) {

    /**
     * Get today's devotional based on device timezone
     */
    fun getTodayDevotional(timezone: String = "UTC"): Flow<Result<DevotionalResponse>> = flow {
        emit(Result.Loading)

        try {
            // Try to get cached today's devotional
            val today = LocalDate.now().format(DateTimeFormatter.ISO_DATE)
            devotionalDao.getDevotionalByDate(today).collect { cached ->
                if (cached != null) {
                    // Emit cached data first (could convert to response model)
                }
            }

            // Fetch from network
            val response = apiService.getTodayDevotional(timezone)

            if (response.isSuccessful) {
                val devotional = response.body()
                if (devotional != null) {
                    // Cache the devotional
                    cacheDevotional(devotional)
                    emit(Result.Success(devotional))
                } else {
                    emit(Result.Error(Exception("No devotional found")))
                }
            } else {
                emit(Result.Error(Exception("API error: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.Error(e, e.message))
        }
    }

    /**
     * Get devotionals list with optional date filter
     */
    fun getDevotionals(
        date: String? = null,
        page: Int = 1
    ): Flow<Result<DevotionalListResponse>> = flow {
        emit(Result.Loading)

        try {
            val response = apiService.getDevotionals(date = date, page = page)

            if (response.isSuccessful) {
                val data = response.body()
                if (data != null) {
                    // Cache devotionals
                    cacheDevotionals(data.devotionals.mapNotNull { summary ->
                        // Convert summary to full devotional if needed
                        null
                    })
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
     * Get a specific devotional by ID
     */
    fun getDevotional(devotionalId: Long): Flow<Result<DevotionalResponse>> = flow {
        emit(Result.Loading)

        try {
            // Try cache first
            devotionalDao.getDevotional(devotionalId).collect { cached ->
                if (cached != null) {
                    // Could emit cached version
                }
            }

            // Fetch from network
            val response = apiService.getDevotional(devotionalId)

            if (response.isSuccessful) {
                val devotional = response.body()
                if (devotional != null) {
                    cacheDevotional(devotional)
                    emit(Result.Success(devotional))
                } else {
                    emit(Result.Error(Exception("Devotional not found")))
                }
            } else {
                emit(Result.Error(Exception("API error: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.Error(e, e.message))
        }
    }

    /**
     * Get cached devotionals for offline access
     */
    fun getCachedDevotionals(): Flow<List<DevotionalEntity>> {
        return devotionalDao.getAllDevotionals()
    }

    private suspend fun cacheDevotional(devotional: DevotionalResponse) {
        val entity = DevotionalEntity(
            id = devotional.id,
            slug = devotional.slug,
            title = devotional.title,
            author = devotional.author,
            bodyMd = devotional.bodyMd,
            date = devotional.date,
            audioDownloadUrl = devotional.audioAsset?.downloadUrl
        )
        devotionalDao.insertDevotional(entity)
    }

    private suspend fun cacheDevotionals(devotionals: List<DevotionalResponse>) {
        val entities = devotionals.map { devotional ->
            DevotionalEntity(
                id = devotional.id,
                slug = devotional.slug,
                title = devotional.title,
                author = devotional.author,
                bodyMd = devotional.bodyMd,
                date = devotional.date,
                audioDownloadUrl = devotional.audioAsset?.downloadUrl
            )
        }
        devotionalDao.insertDevotionals(entities)
    }
}
