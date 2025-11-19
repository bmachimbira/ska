package com.sda.feature.devotionals.presentation.today

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
import com.sda.core.network.model.DevotionalResponse

/**
 * Today's Devotional screen
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TodayDevotionalScreen(
    onBackClick: () -> Unit,
    onArchiveClick: () -> Unit,
    viewModel: TodayDevotionalViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Today's Devotional") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = onArchiveClick) {
                        Icon(Icons.Default.CalendarToday, contentDescription = "Archive")
                    }
                }
            )
        }
    ) { paddingValues ->
        when (val state = uiState) {
            is TodayDevotionalUiState.Loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            is TodayDevotionalUiState.Success -> {
                DevotionalContent(
                    devotional = state.devotional,
                    modifier = Modifier.padding(paddingValues)
                )
            }
            is TodayDevotionalUiState.Error -> {
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
private fun DevotionalContent(
    devotional: DevotionalResponse,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Date
        Text(
            text = devotional.date,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.primary
        )

        // Title
        Text(
            text = devotional.title,
            style = MaterialTheme.typography.headlineMedium
        )

        // Author
        devotional.author?.let { author ->
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.Person,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(20.dp)
                )
                Text(
                    text = "By $author",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Audio button if available
        devotional.audioAsset?.let { audio ->
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
            text = devotional.bodyMd,
            style = MaterialTheme.typography.bodyLarge,
            lineHeight = MaterialTheme.typography.bodyLarge.lineHeight * 1.5f
        )

        // Action buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = { /* TODO: Share */ },
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Share, contentDescription = null)
                Spacer(Modifier.width(4.dp))
                Text("Share")
            }
            OutlinedButton(
                onClick = { /* TODO: Bookmark */ },
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.BookmarkBorder, contentDescription = null)
                Spacer(Modifier.width(4.dp))
                Text("Save")
            }
        }
    }
}
