package com.sda.feature.sermons.presentation.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sda.core.common.result.Result
import com.sda.core.network.model.SermonSummary
import com.sda.feature.sermons.data.repository.SermonRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for Sermon List screen
 */
@HiltViewModel
class SermonListViewModel @Inject constructor(
    private val sermonRepository: SermonRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<SermonListUiState>(SermonListUiState.Loading)
    val uiState: StateFlow<SermonListUiState> = _uiState.asStateFlow()

    private var currentPage = 1
    private val allSermons = mutableListOf<SermonSummary>()

    init {
        loadSermons()
    }

    fun loadSermons(refresh: Boolean = false) {
        if (refresh) {
            currentPage = 1
            allSermons.clear()
        }

        viewModelScope.launch {
            sermonRepository.getSermons(page = currentPage).collect { result ->
                _uiState.value = when (result) {
                    is Result.Loading -> SermonListUiState.Loading
                    is Result.Success -> {
                        allSermons.addAll(result.data.sermons)
                        SermonListUiState.Success(
                            sermons = allSermons.toList(),
                            hasMore = result.data.pagination.page < result.data.pagination.pages
                        )
                    }
                    is Result.Error -> SermonListUiState.Error(
                        message = result.message ?: result.exception.message ?: "Unknown error"
                    )
                }
            }
        }
    }

    fun loadMore() {
        val state = _uiState.value
        if (state is SermonListUiState.Success && state.hasMore) {
            currentPage++
            loadSermons()
        }
    }

    fun onRefresh() {
        loadSermons(refresh = true)
    }

    fun onSermonClick(sermonId: Long) {
        // Navigation handled by composable
    }
}

/**
 * UI State for Sermon List
 */
sealed interface SermonListUiState {
    data object Loading : SermonListUiState

    data class Success(
        val sermons: List<SermonSummary>,
        val hasMore: Boolean
    ) : SermonListUiState

    data class Error(val message: String) : SermonListUiState
}
