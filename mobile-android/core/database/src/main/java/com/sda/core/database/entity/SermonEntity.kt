package com.sda.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sermons")
data class SermonEntity(
    @PrimaryKey val id: Long,
    val title: String,
    val description: String?,
    val scriptureRefs: List<String>?,
    val speakerName: String?,
    val seriesTitle: String?,
    val videoHlsUrl: String?,
    val audioDownloadUrl: String?,
    val thumbnailUrl: String?,
    val publishedAt: String?,
    val isFeatured: Boolean,
    val cachedAt: Long = System.currentTimeMillis()
)
