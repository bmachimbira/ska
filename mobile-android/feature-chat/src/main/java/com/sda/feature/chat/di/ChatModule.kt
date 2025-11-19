package com.sda.feature.chat.di

import com.sda.core.network.api.SDAApiService
import com.sda.feature.chat.data.repository.ChatRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Hilt module for Chat feature dependencies
 */
@Module
@InstallIn(SingletonComponent::class)
object ChatModule {

    @Provides
    @Singleton
    fun provideChatRepository(
        apiService: SDAApiService
    ): ChatRepository {
        return ChatRepository(apiService)
    }
}
