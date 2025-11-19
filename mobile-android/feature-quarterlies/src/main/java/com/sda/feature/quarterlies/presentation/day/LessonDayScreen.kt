package com.sda.feature.quarterlies.presentation.day

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.sda.core.network.model.LessonDayResponse

/**
 * Lesson Day detail screen with markdown content
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LessonDayScreen(
    onBackClick: () -> Unit,
    onPreviousDay: (() -> Unit)? = null,
    onNextDay: (() -> Unit)? = null,
    viewModel: LessonDayViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Lesson Day") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        when (val state = uiState) {
            is LessonDayUiState.Loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            is LessonDayUiState.Success -> {
                LessonDayContent(
                    day = state.day,
                    onPreviousDay = onPreviousDay,
                    onNextDay = onNextDay,
                    modifier = Modifier.padding(paddingValues)
                )
            }
            is LessonDayUiState.Error -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
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

@Composable
private fun LessonDayContent(
    day: LessonDayResponse,
    onPreviousDay: (() -> Unit)?,
    onNextDay: (() -> Unit)?,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.fillMaxSize()) {
        // Main content
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Day indicator
            Text(
                text = "Day ${day.dayIndex}${day.date?.let { " • $it" } ?: ""}",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.primary
            )

            // Title
            Text(
                text = day.title,
                style = MaterialTheme.typography.headlineMedium
            )

            // Memory verse if available
            day.memoryVerse?.let { verse ->
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Memory Verse",
                            style = MaterialTheme.typography.titleSmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            text = verse,
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }

            // Audio button if available
            day.audioAsset?.let { audio ->
                FilledTonalButton(
                    onClick = { /* TODO: Play audio */ },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Headset, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text("Listen to Audio")
                }
            }

            Divider()

            // Body content (Markdown)
            // For now, display as plain text
            // TODO: Add markdown rendering library
            Text(
                text = day.bodyMd,
                style = MaterialTheme.typography.bodyLarge,
                lineHeight = MaterialTheme.typography.bodyLarge.lineHeight * 1.5f
            )
        }

        // Navigation buttons
        if (onPreviousDay != null || onNextDay != null) {
            Divider()
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                onPreviousDay?.let {
                    OutlinedButton(
                        onClick = it,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.ArrowBack, contentDescription = null)
                        Spacer(Modifier.width(4.dp))
                        Text("Previous")
                    }
                }
                onNextDay?.let {
                    FilledTonalButton(
                        onClick = it,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Next")
                        Spacer(Modifier.width(4.dp))
                        Icon(Icons.Default.ArrowForward, contentDescription = null)
                    }
                }
            }
        }
    }
}
