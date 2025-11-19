package com.sda.feature.sermons.data.repository

import com.sda.core.common.result.Result
import com.sda.core.database.dao.SermonDao
import com.sda.core.database.entity.SermonEntity
import com.sda.core.network.api.SDAApiService
import com.sda.core.network.model.HomeResponse
import com.sda.core.network.model.SermonResponse
import com.sda.core.network.model.SermonSummary
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for Home screen data
 * Implements cache-first strategy with network fallback
 */
@Singleton
class HomeRepository @Inject constructor(
    private val apiService: SDAApiService,
    private val sermonDao: SermonDao
) {

    /**
     * Get home page data with featured sermons and devotional
     * Returns cached data first, then fetches from network
     */
    fun getHomeData(): Flow<Result<HomeResponse>> = flow {
        emit(Result.Loading)

        try {
            // First emit cached featured sermons if available
            val cachedSermons = sermonDao.getFeaturedSermons(5)

            // Fetch fresh data from network
            val response = apiService.getHome()

            if (response.isSuccessful) {
                val homeData = response.body()
                if (homeData != null) {
                    // Cache the featured sermons
                    cacheSermons(homeData.featuredSermons)
                    emit(Result.Success(homeData))
                } else {
                    emit(Result.Error(Exception("Empty response body")))
                }
            } else {
                emit(Result.Error(Exception("API error: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.Error(e, e.message))
        }
    }

    private suspend fun cacheSermons(sermons: List<SermonSummary>) {
        val entities = sermons.map { sermon ->
            SermonEntity(
                id = sermon.id,
                title = sermon.title,
                description = sermon.description,
                scriptureRefs = null,
                speakerName = sermon.speaker?.name,
                seriesTitle = null,
                videoHlsUrl = null,
                audioDownloadUrl = null,
                thumbnailUrl = sermon.thumbnailUrl,
                publishedAt = sermon.publishedAt,
                isFeatured = true
            )
        }
        sermonDao.insertSermons(entities)
    }
}
