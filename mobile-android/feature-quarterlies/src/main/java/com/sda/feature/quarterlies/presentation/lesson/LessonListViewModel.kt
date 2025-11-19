package com.sda.feature.quarterlies.presentation.lesson

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sda.core.common.result.Result
import com.sda.core.network.model.LessonSummary
import com.sda.feature.quarterlies.data.repository.QuarterlyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for Lesson List screen
 */
@HiltViewModel
class LessonListViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val quarterlyRepository: QuarterlyRepository
) : ViewModel() {

    private val quarterlyId: Long = checkNotNull(savedStateHandle["quarterlyId"])

    private val _uiState = MutableStateFlow<LessonListUiState>(LessonListUiState.Loading)
    val uiState: StateFlow<LessonListUiState> = _uiState.asStateFlow()

    init {
        loadLessons()
    }

    private fun loadLessons() {
        viewModelScope.launch {
            quarterlyRepository.getLessons(quarterlyId).collect { result ->
                _uiState.value = when (result) {
                    is Result.Loading -> LessonListUiState.Loading
                    is Result.Success -> LessonListUiState.Success(lessons = result.data.lessons)
                    is Result.Error -> LessonListUiState.Error(
                        message = result.message ?: result.exception.message ?: "Unknown error"
                    )
                }
            }
        }
    }

    fun onRetry() {
        loadLessons()
    }
}

/**
 * UI State for Lesson List
 */
sealed interface LessonListUiState {
    data object Loading : LessonListUiState
    data class Success(val lessons: List<LessonSummary>) : LessonListUiState
    data class Error(val message: String) : LessonListUiState
}
