package com.sda.feature.chat.data.repository

import com.sda.core.common.result.Result
import com.sda.core.network.api.SDAApiService
import com.sda.core.network.model.ChatQueryRequest
import com.sda.core.network.model.ChatResponse
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for chat/RAG functionality
 */
@Singleton
class ChatRepository @Inject constructor(
    private val apiService: SDAApiService
) {

    /**
     * Send a chat query and get response
     */
    fun sendQuery(
        query: String,
        mode: String = "general",
        quarterlyId: Long? = null,
        conversationHistory: List<Pair<String, String>> = emptyList()
    ): Flow<Result<ChatResponse>> = flow {
        emit(Result.Loading)

        try {
            val request = ChatQueryRequest(
                query = query,
                mode = mode,
                filter = if (quarterlyId != null) {
                    mapOf("quarterlyId" to quarterlyId)
                } else null,
                stream = false,
                conversationHistory = conversationHistory.map { (role, content) ->
                    mapOf("role" to role, "content" to content)
                }
            )

            val response = apiService.chatQuery(request)

            if (response.isSuccessful) {
                val chatResponse = response.body()
                if (chatResponse != null) {
                    emit(Result.Success(chatResponse))
                } else {
                    emit(Result.Error(Exception("Empty response"), "No response from server"))
                }
            } else {
                emit(Result.Error(
                    Exception("HTTP ${response.code()}"),
                    "Failed to get response: ${response.message()}"
                ))
            }
        } catch (e: Exception) {
            emit(Result.Error(e, e.message ?: "Failed to send query"))
        }
    }
}
