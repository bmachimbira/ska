package com.sda.feature.quarterlies.presentation.list

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.sda.core.network.model.QuarterlySummary

/**
 * Quarterly List screen with tabs for Adult/Youth/Kids
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuarterlyListScreen(
    onQuarterlyClick: (Long) -> Unit,
    onBackClick: () -> Unit,
    viewModel: QuarterlyListViewModel = hiltViewModel()
) {
    val selectedKind by viewModel.selectedKind.collectAsStateWithLifecycle()
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Sabbath School") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(modifier = Modifier.padding(paddingValues)) {
            // Tabs for Adult/Youth/Kids
            TabRow(selectedTabIndex = when (selectedKind) {
                "adult" -> 0
                "youth" -> 1
                "kids" -> 2
                else -> 0
            }) {
                Tab(
                    selected = selectedKind == "adult",
                    onClick = { viewModel.selectKind("adult") },
                    text = { Text("Adult") }
                )
                Tab(
                    selected = selectedKind == "youth",
                    onClick = { viewModel.selectKind("youth") },
                    text = { Text("Youth") }
                )
                Tab(
                    selected = selectedKind == "kids",
                    onClick = { viewModel.selectKind("kids") },
                    text = { Text("Kids") }
                )
            }

            // Content
            when (val state = uiState) {
                is QuarterlyListUiState.Loading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }
                is QuarterlyListUiState.Success -> {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(state.quarterlies) { quarterly ->
                            QuarterlyCard(
                                quarterly = quarterly,
                                onClick = { onQuarterlyClick(quarterly.id) }
                            )
                        }
                    }
                }
                is QuarterlyListUiState.Error -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Text(
                                text = state.message,
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.error
                            )
                            Button(onClick = viewModel::onRetry) {
                                Text("Retry")
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuarterlyCard(
    quarterly: QuarterlySummary,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                modifier = Modifier.size(64.dp),
                shape = MaterialTheme.shapes.medium,
                color = MaterialTheme.colorScheme.primaryContainer
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = "Q${quarterly.quarter}",
                        style = MaterialTheme.typography.headlineSmall,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = quarterly.title,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = "${quarterly.kind.replaceFirstChar { it.uppercase() }} • ${quarterly.year}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
