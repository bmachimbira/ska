package com.sda.core.database.dao

import androidx.room.*
import com.sda.core.database.entity.QuarterlyEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface QuarterlyDao {
    @Query("SELECT * FROM quarterlies WHERE kind = :kind ORDER BY year DESC, quarter DESC")
    fun getQuarterliesByKind(kind: String): Flow<List<QuarterlyEntity>>

    @Query("SELECT * FROM quarterlies WHERE id = :quarterlyId")
    fun getQuarterly(quarterlyId: Long): Flow<QuarterlyEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuarterly(quarterly: QuarterlyEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuarterlies(quarterlies: List<QuarterlyEntity>)

    @Delete
    suspend fun deleteQuarterly(quarterly: QuarterlyEntity)

    @Query("DELETE FROM quarterlies")
    suspend fun clearAll()
}
