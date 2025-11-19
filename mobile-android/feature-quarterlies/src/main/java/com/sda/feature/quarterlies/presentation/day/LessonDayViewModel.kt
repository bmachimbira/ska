package com.sda.feature.quarterlies.presentation.day

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sda.core.common.result.Result
import com.sda.core.network.model.LessonDayResponse
import com.sda.feature.quarterlies.data.repository.QuarterlyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for Lesson Day detail screen
 */
@HiltViewModel
class LessonDayViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val quarterlyRepository: QuarterlyRepository
) : ViewModel() {

    private val lessonId: Long = checkNotNull(savedStateHandle["lessonId"])
    private val dayIndex: Int = checkNotNull(savedStateHandle["dayIndex"])

    private val _uiState = MutableStateFlow<LessonDayUiState>(LessonDayUiState.Loading)
    val uiState: StateFlow<LessonDayUiState> = _uiState.asStateFlow()

    init {
        loadLessonDay()
    }

    private fun loadLessonDay() {
        viewModelScope.launch {
            quarterlyRepository.getLessonDay(lessonId, dayIndex).collect { result ->
                _uiState.value = when (result) {
                    is Result.Loading -> LessonDayUiState.Loading
                    is Result.Success -> LessonDayUiState.Success(day = result.data)
                    is Result.Error -> LessonDayUiState.Error(
                        message = result.message ?: result.exception.message ?: "Unknown error"
                    )
                }
            }
        }
    }

    fun onRetry() {
        loadLessonDay()
    }
}

/**
 * UI State for Lesson Day
 */
sealed interface LessonDayUiState {
    data object Loading : LessonDayUiState
    data class Success(val day: LessonDayResponse) : LessonDayUiState
    data class Error(val message: String) : LessonDayUiState
}
