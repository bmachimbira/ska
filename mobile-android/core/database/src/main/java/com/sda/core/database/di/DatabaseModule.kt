package com.sda.core.database.di

import android.content.Context
import androidx.room.Room
import com.sda.core.database.SDADatabase
import com.sda.core.database.dao.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(
        @ApplicationContext context: Context
    ): SDADatabase = Room.databaseBuilder(
        context,
        SDADatabase::class.java,
        SDADatabase.DATABASE_NAME
    )
        .fallbackToDestructiveMigration()
        .build()

    @Provides
    @Singleton
    fun provideSermonDao(database: SDADatabase): SermonDao =
        database.sermonDao()

    @Provides
    @Singleton
    fun provideDevotionalDao(database: SDADatabase): DevotionalDao =
        database.devotionalDao()

    @Provides
    @Singleton
    fun provideQuarterlyDao(database: SDADatabase): QuarterlyDao =
        database.quarterlyDao()

    @Provides
    @Singleton
    fun provideLessonDao(database: SDADatabase): LessonDao =
        database.lessonDao()

    @Provides
    @Singleton
    fun provideLessonDayDao(database: SDADatabase): LessonDayDao =
        database.lessonDayDao()
}
