package com.sda.core.database.dao

import androidx.room.*
import com.sda.core.database.entity.DevotionalEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface DevotionalDao {
    @Query("SELECT * FROM devotionals ORDER BY date DESC")
    fun getAllDevotionals(): Flow<List<DevotionalEntity>>

    @Query("SELECT * FROM devotionals WHERE id = :devotionalId")
    fun getDevotional(devotionalId: Long): Flow<DevotionalEntity?>

    @Query("SELECT * FROM devotionals WHERE date = :date LIMIT 1")
    fun getDevotionalByDate(date: String): Flow<DevotionalEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDevotional(devotional: DevotionalEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDevotionals(devotionals: List<DevotionalEntity>)

    @Delete
    suspend fun deleteDevotional(devotional: DevotionalEntity)

    @Query("DELETE FROM devotionals WHERE cachedAt < :expiryTime")
    suspend fun deleteExpiredDevotionals(expiryTime: Long)

    @Query("DELETE FROM devotionals")
    suspend fun clearAll()
}
