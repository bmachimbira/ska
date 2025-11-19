package com.sda.core.database.dao

import androidx.room.*
import com.sda.core.database.entity.SermonEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SermonDao {
    @Query("SELECT * FROM sermons ORDER BY publishedAt DESC")
    fun getAllSermons(): Flow<List<SermonEntity>>

    @Query("SELECT * FROM sermons WHERE id = :sermonId")
    fun getSermon(sermonId: Long): Flow<SermonEntity?>

    @Query("SELECT * FROM sermons WHERE isFeatured = 1 ORDER BY publishedAt DESC LIMIT :limit")
    fun getFeaturedSermons(limit: Int = 5): Flow<List<SermonEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSermon(sermon: SermonEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSermons(sermons: List<SermonEntity>)

    @Delete
    suspend fun deleteSermon(sermon: SermonEntity)

    @Query("DELETE FROM sermons WHERE cachedAt < :expiryTime")
    suspend fun deleteExpiredSermons(expiryTime: Long)

    @Query("DELETE FROM sermons")
    suspend fun clearAll()
}
