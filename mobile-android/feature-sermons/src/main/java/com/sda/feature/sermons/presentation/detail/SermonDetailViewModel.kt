package com.sda.feature.sermons.presentation.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sda.core.common.result.Result
import com.sda.core.network.model.SermonResponse
import com.sda.feature.sermons.data.repository.SermonRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for Sermon Detail screen
 */
@HiltViewModel
class SermonDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val sermonRepository: SermonRepository
) : ViewModel() {

    private val sermonId: Long = checkNotNull(savedStateHandle["sermonId"])

    private val _uiState = MutableStateFlow<SermonDetailUiState>(SermonDetailUiState.Loading)
    val uiState: StateFlow<SermonDetailUiState> = _uiState.asStateFlow()

    init {
        loadSermon()
    }

    private fun loadSermon() {
        viewModelScope.launch {
            sermonRepository.getSermon(sermonId).collect { result ->
                _uiState.value = when (result) {
                    is Result.Loading -> SermonDetailUiState.Loading
                    is Result.Success -> SermonDetailUiState.Success(sermon = result.data)
                    is Result.Error -> SermonDetailUiState.Error(
                        message = result.message ?: result.exception.message ?: "Unknown error"
                    )
                }
            }
        }
    }

    fun onPlayVideo(videoUrl: String) {
        // Will trigger navigation to player
    }

    fun onPlayAudio(audioUrl: String) {
        // Will trigger navigation to player or audio service
    }

    fun onRetry() {
        loadSermon()
    }
}

/**
 * UI State for Sermon Detail
 */
sealed interface SermonDetailUiState {
    data object Loading : SermonDetailUiState
    data class Success(val sermon: SermonResponse) : SermonDetailUiState
    data class Error(val message: String) : SermonDetailUiState
}
