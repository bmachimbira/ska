package com.sda.feature.quarterlies.presentation.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sda.core.common.result.Result
import com.sda.core.network.model.QuarterlySummary
import com.sda.feature.quarterlies.data.repository.QuarterlyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for Quarterly List screen
 */
@HiltViewModel
class QuarterlyListViewModel @Inject constructor(
    private val quarterlyRepository: QuarterlyRepository
) : ViewModel() {

    private val _selectedKind = MutableStateFlow("adult")
    val selectedKind: StateFlow<String> = _selectedKind.asStateFlow()

    private val _uiState = MutableStateFlow<QuarterlyListUiState>(QuarterlyListUiState.Loading)
    val uiState: StateFlow<QuarterlyListUiState> = _uiState.asStateFlow()

    init {
        loadQuarterlies()
    }

    fun selectKind(kind: String) {
        _selectedKind.value = kind
        loadQuarterlies()
    }

    private fun loadQuarterlies() {
        viewModelScope.launch {
            quarterlyRepository.getQuarterlies(kind = _selectedKind.value).collect { result ->
                _uiState.value = when (result) {
                    is Result.Loading -> QuarterlyListUiState.Loading
                    is Result.Success -> QuarterlyListUiState.Success(
                        quarterlies = result.data.quarterlies
                    )
                    is Result.Error -> QuarterlyListUiState.Error(
                        message = result.message ?: result.exception.message ?: "Unknown error"
                    )
                }
            }
        }
    }

    fun onRetry() {
        loadQuarterlies()
    }
}

/**
 * UI State for Quarterly List
 */
sealed interface QuarterlyListUiState {
    data object Loading : QuarterlyListUiState
    data class Success(val quarterlies: List<QuarterlySummary>) : QuarterlyListUiState
    data class Error(val message: String) : QuarterlyListUiState
}
