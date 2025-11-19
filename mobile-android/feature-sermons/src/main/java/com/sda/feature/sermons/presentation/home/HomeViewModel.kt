package com.sda.feature.sermons.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sda.core.common.result.Result
import com.sda.core.network.model.DevotionalSummary
import com.sda.core.network.model.QuarterlySummary
import com.sda.core.network.model.SermonSummary
import com.sda.feature.sermons.data.repository.HomeRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for the Home screen
 */
@HiltViewModel
class HomeViewModel @Inject constructor(
    private val homeRepository: HomeRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.Loading)
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadHomeData()
    }

    fun loadHomeData() {
        viewModelScope.launch {
            homeRepository.getHomeData().collect { result ->
                _uiState.value = when (result) {
                    is Result.Loading -> HomeUiState.Loading
                    is Result.Success -> HomeUiState.Success(
                        featuredSermons = result.data.featuredSermons,
                        todayDevotional = result.data.todayDevotional,
                        currentQuarterlies = result.data.currentQuarterlies
                    )
                    is Result.Error -> HomeUiState.Error(
                        message = result.message ?: result.exception.message ?: "Unknown error"
                    )
                }
            }
        }
    }

    fun onSermonClick(sermonId: Long) {
        // Navigation will be handled by the composable
    }

    fun onDevotionalClick() {
        // Navigation will be handled by the composable
    }

    fun onQuarterlyClick(quarterlyId: Long) {
        // Navigation will be handled by the composable
    }

    fun onRetry() {
        loadHomeData()
    }
}

/**
 * UI State for Home screen
 */
sealed interface HomeUiState {
    data object Loading : HomeUiState

    data class Success(
        val featuredSermons: List<SermonSummary>,
        val todayDevotional: DevotionalSummary?,
        val currentQuarterlies: List<QuarterlySummary>
    ) : HomeUiState

    data class Error(val message: String) : HomeUiState
}
