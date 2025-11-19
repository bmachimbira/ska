package com.sda.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.sda.core.database.dao.*
import com.sda.core.database.entity.*

/**
 * Main database for the SDA Content App
 * Caches content for offline access
 */
@Database(
    entities = [
        SermonEntity::class,
        DevotionalEntity::class,
        QuarterlyEntity::class,
        LessonEntity::class,
        LessonDayEntity::class
    ],
    version = 1,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class SDADatabase : RoomDatabase() {
    abstract fun sermonDao(): SermonDao
    abstract fun devotionalDao(): DevotionalDao
    abstract fun quarterlyDao(): QuarterlyDao
    abstract fun lessonDao(): LessonDao
    abstract fun lessonDayDao(): LessonDayDao

    companion object {
        const val DATABASE_NAME = "sda_database"
    }
}
