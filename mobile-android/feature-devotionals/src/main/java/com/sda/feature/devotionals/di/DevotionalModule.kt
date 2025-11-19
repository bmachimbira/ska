package com.sda.feature.devotionals.di

import com.sda.core.database.dao.DevotionalDao
import com.sda.core.network.api.SDAApiService
import com.sda.feature.devotionals.data.repository.DevotionalRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Hilt module for devotional feature dependencies
 */
@Module
@InstallIn(SingletonComponent::class)
object DevotionalModule {

    @Provides
    @Singleton
    fun provideDevotionalRepository(
        apiService: SDAApiService,
        devotionalDao: DevotionalDao
    ): DevotionalRepository {
        return DevotionalRepository(apiService, devotionalDao)
    }
}
