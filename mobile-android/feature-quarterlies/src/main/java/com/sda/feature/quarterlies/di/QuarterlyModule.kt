package com.sda.feature.quarterlies.di

import com.sda.core.database.dao.LessonDao
import com.sda.core.database.dao.LessonDayDao
import com.sda.core.database.dao.QuarterlyDao
import com.sda.core.network.api.SDAApiService
import com.sda.feature.quarterlies.data.repository.QuarterlyRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Hilt module for Quarterly feature dependencies
 */
@Module
@InstallIn(SingletonComponent::class)
object QuarterlyModule {

    @Provides
    @Singleton
    fun provideQuarterlyRepository(
        apiService: SDAApiService,
        quarterlyDao: QuarterlyDao,
        lessonDao: LessonDao,
        lessonDayDao: LessonDayDao
    ): QuarterlyRepository {
        return QuarterlyRepository(
            apiService = apiService,
            quarterlyDao = quarterlyDao,
            lessonDao = lessonDao,
            lessonDayDao = lessonDayDao
        )
    }
}
