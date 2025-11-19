package com.sda.feature.chat.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sda.core.common.result.Result
import com.sda.core.network.model.ChatResponse
import com.sda.core.network.model.ChatSource
import com.sda.feature.chat.data.repository.ChatRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Data class representing a chat message
 */
data class ChatMessage(
    val id: String,
    val content: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis(),
    val sources: List<ChatSource> = emptyList()
)

/**
 * UI state for chat screen
 */
sealed interface ChatUiState {
    data object Initial : ChatUiState
    data class Success(
        val messages: List<ChatMessage>,
        val isLoading: Boolean = false
    ) : ChatUiState
    data class Error(val message: String) : ChatUiState
}

/**
 * ViewModel for chat functionality
 */
@HiltViewModel
class ChatViewModel @Inject constructor(
    private val repository: ChatRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<ChatUiState>(ChatUiState.Initial)
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    private val _selectedMode = MutableStateFlow("general")
    val selectedMode: StateFlow<String> = _selectedMode.asStateFlow()

    private val _selectedQuarterlyId = MutableStateFlow<Long?>(null)
    val selectedQuarterlyId: StateFlow<Long?> = _selectedQuarterlyId.asStateFlow()

    private val messages = mutableListOf<ChatMessage>()

    init {
        // Initialize with empty success state
        _uiState.value = ChatUiState.Success(messages = emptyList())
    }

    /**
     * Send a chat query
     */
    fun sendMessage(query: String) {
        if (query.isBlank()) return

        // Add user message
        val userMessage = ChatMessage(
            id = System.currentTimeMillis().toString(),
            content = query,
            isUser = true
        )
        messages.add(userMessage)

        // Update UI to show user message and loading state
        _uiState.value = ChatUiState.Success(
            messages = messages.toList(),
            isLoading = true
        )

        // Get conversation history for context
        val conversationHistory = messages
            .filter { it.id != userMessage.id } // Exclude the message we just added
            .takeLast(6) // Last 6 messages for context
            .map { msg ->
                if (msg.isUser) "user" to msg.content
                else "assistant" to msg.content
            }

        // Send to API
        viewModelScope.launch {
            repository.sendQuery(
                query = query,
                mode = _selectedMode.value,
                quarterlyId = _selectedQuarterlyId.value,
                conversationHistory = conversationHistory
            ).collect { result ->
                when (result) {
                    is Result.Loading -> {
                        // Already showing loading
                    }
                    is Result.Success -> {
                        handleSuccessResponse(result.data)
                    }
                    is Result.Error -> {
                        handleError(result.message ?: "Failed to get response")
                    }
                }
            }
        }
    }

    /**
     * Handle successful API response
     */
    private fun handleSuccessResponse(response: ChatResponse) {
        val assistantMessage = ChatMessage(
            id = System.currentTimeMillis().toString(),
            content = response.answer,
            isUser = false,
            sources = response.sources
        )
        messages.add(assistantMessage)

        _uiState.value = ChatUiState.Success(
            messages = messages.toList(),
            isLoading = false
        )
    }

    /**
     * Handle error
     */
    private fun handleError(message: String) {
        // Add error message as assistant message
        val errorMessage = ChatMessage(
            id = System.currentTimeMillis().toString(),
            content = "Sorry, I encountered an error: $message",
            isUser = false
        )
        messages.add(errorMessage)

        _uiState.value = ChatUiState.Success(
            messages = messages.toList(),
            isLoading = false
        )
    }

    /**
     * Set chat mode
     */
    fun setMode(mode: String) {
        _selectedMode.value = mode
    }

    /**
     * Set quarterly filter for quarterly mode
     */
    fun setQuarterly(quarterlyId: Long?) {
        _selectedQuarterlyId.value = quarterlyId
        if (quarterlyId != null) {
            _selectedMode.value = "quarterly"
        }
    }

    /**
     * Clear chat history
     */
    fun clearChat() {
        messages.clear()
        _uiState.value = ChatUiState.Success(messages = emptyList())
    }
}
