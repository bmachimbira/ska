package com.sda.feature.devotionals.presentation.today

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sda.core.common.result.Result
import com.sda.core.network.model.DevotionalResponse
import com.sda.feature.devotionals.data.repository.DevotionalRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for Today's Devotional screen
 */
@HiltViewModel
class TodayDevotionalViewModel @Inject constructor(
    private val devotionalRepository: DevotionalRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<TodayDevotionalUiState>(TodayDevotionalUiState.Loading)
    val uiState: StateFlow<TodayDevotionalUiState> = _uiState.asStateFlow()

    init {
        loadTodayDevotional()
    }

    fun loadTodayDevotional() {
        viewModelScope.launch {
            devotionalRepository.getTodayDevotional().collect { result ->
                _uiState.value = when (result) {
                    is Result.Loading -> TodayDevotionalUiState.Loading
                    is Result.Success -> TodayDevotionalUiState.Success(devotional = result.data)
                    is Result.Error -> TodayDevotionalUiState.Error(
                        message = result.message ?: result.exception.message ?: "Unknown error"
                    )
                }
            }
        }
    }

    fun onRetry() {
        loadTodayDevotional()
    }
}

/**
 * UI State for Today's Devotional
 */
sealed interface TodayDevotionalUiState {
    data object Loading : TodayDevotionalUiState
    data class Success(val devotional: DevotionalResponse) : TodayDevotionalUiState
    data class Error(val message: String) : TodayDevotionalUiState
}
