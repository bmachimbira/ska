package com.sda.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "quarterlies")
data class QuarterlyEntity(
    @PrimaryKey val id: Long,
    val kind: String,
    val title: String,
    val description: String?,
    val year: Int,
    val quarter: Int,
    val lang: String,
    val cachedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "lessons")
data class LessonEntity(
    @PrimaryKey val id: Long,
    val quarterlyId: Long,
    val indexInQuarter: Int,
    val title: String,
    val description: String?,
    val cachedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "lesson_days")
data class LessonDayEntity(
    @PrimaryKey val id: Long,
    val lessonId: Long,
    val dayIndex: Int,
    val date: String?,
    val title: String,
    val bodyMd: String,
    val memoryVerse: String?,
    val audioDownloadUrl: String?,
    val cachedAt: Long = System.currentTimeMillis()
)
