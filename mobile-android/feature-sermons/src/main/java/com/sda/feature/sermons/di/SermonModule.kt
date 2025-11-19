package com.sda.feature.sermons.di

import com.sda.core.database.dao.SermonDao
import com.sda.core.network.api.SDAApiService
import com.sda.feature.sermons.data.repository.HomeRepository
import com.sda.feature.sermons.data.repository.SermonRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Hilt module for sermon feature dependencies
 */
@Module
@InstallIn(SingletonComponent::class)
object SermonModule {

    @Provides
    @Singleton
    fun provideHomeRepository(
        apiService: SDAApiService,
        sermonDao: SermonDao
    ): HomeRepository {
        return HomeRepository(apiService, sermonDao)
    }

    @Provides
    @Singleton
    fun provideSermonRepository(
        apiService: SDAApiService,
        sermonDao: SermonDao
    ): SermonRepository {
        return SermonRepository(apiService, sermonDao)
    }
}
