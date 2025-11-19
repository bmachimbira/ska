package com.sda.feature.devotionals.presentation.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sda.core.common.result.Result
import com.sda.core.network.model.DevotionalSummary
import com.sda.feature.devotionals.data.repository.DevotionalRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for Devotional List/Archive screen
 */
@HiltViewModel
class DevotionalListViewModel @Inject constructor(
    private val devotionalRepository: DevotionalRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<DevotionalListUiState>(DevotionalListUiState.Loading)
    val uiState: StateFlow<DevotionalListUiState> = _uiState.asStateFlow()

    private var currentPage = 1
    private val allDevotionals = mutableListOf<DevotionalSummary>()

    init {
        loadDevotionals()
    }

    fun loadDevotionals(refresh: Boolean = false) {
        if (refresh) {
            currentPage = 1
            allDevotionals.clear()
        }

        viewModelScope.launch {
            devotionalRepository.getDevotionals(page = currentPage).collect { result ->
                _uiState.value = when (result) {
                    is Result.Loading -> DevotionalListUiState.Loading
                    is Result.Success -> {
                        allDevotionals.addAll(result.data.devotionals)
                        DevotionalListUiState.Success(
                            devotionals = allDevotionals.toList(),
                            hasMore = result.data.pagination.page < result.data.pagination.pages
                        )
                    }
                    is Result.Error -> DevotionalListUiState.Error(
                        message = result.message ?: result.exception.message ?: "Unknown error"
                    )
                }
            }
        }
    }

    fun loadMore() {
        val state = _uiState.value
        if (state is DevotionalListUiState.Success && state.hasMore) {
            currentPage++
            loadDevotionals()
        }
    }

    fun onRefresh() {
        loadDevotionals(refresh = true)
    }
}

/**
 * UI State for Devotional List
 */
sealed interface DevotionalListUiState {
    data object Loading : DevotionalListUiState

    data class Success(
        val devotionals: List<DevotionalSummary>,
        val hasMore: Boolean
    ) : DevotionalListUiState

    data class Error(val message: String) : DevotionalListUiState
}
