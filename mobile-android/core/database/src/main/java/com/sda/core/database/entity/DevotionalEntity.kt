package com.sda.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "devotionals")
data class DevotionalEntity(
    @PrimaryKey val id: Long,
    val slug: String,
    val title: String,
    val author: String?,
    val bodyMd: String,
    val date: String,
    val audioDownloadUrl: String?,
    val cachedAt: Long = System.currentTimeMillis()
)
