package com.sda.feature.sermons.data.repository

import com.sda.core.common.result.Result
import com.sda.core.database.dao.SermonDao
import com.sda.core.database.entity.SermonEntity
import com.sda.core.network.api.SDAApiService
import com.sda.core.network.model.SermonListResponse
import com.sda.core.network.model.SermonResponse
import com.sda.core.network.model.SermonSummary
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for sermon data
 */
@Singleton
class SermonRepository @Inject constructor(
    private val apiService: SDAApiService,
    private val sermonDao: SermonDao
) {

    /**
     * Get list of sermons with optional filters
     */
    fun getSermons(
        search: String? = null,
        tag: String? = null,
        series: Long? = null,
        speaker: Long? = null,
        page: Int = 1
    ): Flow<Result<SermonListResponse>> = flow {
        emit(Result.Loading)

        try {
            val response = apiService.getSermons(
                search = search,
                tag = tag,
                series = series,
                speaker = speaker,
                page = page
            )

            if (response.isSuccessful) {
                val data = response.body()
                if (data != null) {
                    // Cache sermons
                    cacheSermons(data.sermons)
                    emit(Result.Success(data))
                } else {
                    emit(Result.Error(Exception("Empty response")))
                }
            } else {
                // Try to load from cache if network fails
                val cached = sermonDao.getAllSermons()
                emit(Result.Error(Exception("Network error: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.Error(e, e.message))
        }
    }

    /**
     * Get a single sermon by ID
     */
    fun getSermon(sermonId: Long): Flow<Result<SermonResponse>> = flow {
        emit(Result.Loading)

        try {
            // Try cache first
            sermonDao.getSermon(sermonId).collect { cached ->
                if (cached != null) {
                    // Emit cached data while fetching fresh data
                    // (We'd need to convert entity to response model)
                }
            }

            // Fetch from network
            val response = apiService.getSermon(sermonId)

            if (response.isSuccessful) {
                val sermon = response.body()
                if (sermon != null) {
                    // Cache the sermon
                    cacheSermon(sermon)
                    emit(Result.Success(sermon))
                } else {
                    emit(Result.Error(Exception("Sermon not found")))
                }
            } else {
                emit(Result.Error(Exception("API error: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.Error(e, e.message))
        }
    }

    /**
     * Get featured sermons from cache
     */
    fun getFeaturedSermons(): Flow<List<SermonEntity>> {
        return sermonDao.getFeaturedSermons()
    }

    private suspend fun cacheSermons(sermons: List<SermonSummary>) {
        val entities = sermons.map { toEntity(it) }
        sermonDao.insertSermons(entities)
    }

    private suspend fun cacheSermon(sermon: SermonResponse) {
        val entity = SermonEntity(
            id = sermon.id,
            title = sermon.title,
            description = sermon.description,
            scriptureRefs = sermon.scriptureRefs,
            speakerName = sermon.speaker?.name,
            seriesTitle = sermon.series?.title,
            videoHlsUrl = sermon.videoAsset?.hlsUrl,
            audioDownloadUrl = sermon.audioAsset?.downloadUrl,
            thumbnailUrl = sermon.thumbnailAsset?.downloadUrl,
            publishedAt = sermon.publishedAt,
            isFeatured = sermon.isFeatured
        )
        sermonDao.insertSermon(entity)
    }

    private fun toEntity(summary: SermonSummary): SermonEntity {
        return SermonEntity(
            id = summary.id,
            title = summary.title,
            description = summary.description,
            scriptureRefs = null,
            speakerName = summary.speaker?.name,
            seriesTitle = null,
            videoHlsUrl = null,
            audioDownloadUrl = null,
            thumbnailUrl = summary.thumbnailUrl,
            publishedAt = summary.publishedAt,
            isFeatured = false
        )
    }
}
