package com.sda.feature.sermons.presentation.detail

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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.sda.core.network.model.SermonResponse

/**
 * Sermon Detail screen showing full sermon information
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SermonDetailScreen(
    onBackClick: () -> Unit,
    onPlayVideo: (String) -> Unit,
    onPlayAudio: (String) -> Unit,
    viewModel: SermonDetailViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Sermon Details") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        when (val state = uiState) {
            is SermonDetailUiState.Loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            is SermonDetailUiState.Success -> {
                SermonDetailContent(
                    sermon = state.sermon,
                    onPlayVideo = onPlayVideo,
                    onPlayAudio = onPlayAudio,
                    modifier = Modifier.padding(paddingValues)
                )
            }
            is SermonDetailUiState.Error -> {
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
private fun SermonDetailContent(
    sermon: SermonResponse,
    onPlayVideo: (String) -> Unit,
    onPlayAudio: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        // Thumbnail Image
        sermon.thumbnailAsset?.downloadUrl?.let { thumbnailUrl ->
            AsyncImage(
                model = thumbnailUrl,
                contentDescription = sermon.title,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp),
                contentScale = ContentScale.Crop
            )
        }

        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Title
            Text(
                text = sermon.title,
                style = MaterialTheme.typography.headlineMedium
            )

            // Speaker and Series
            sermon.speaker?.let { speaker ->
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = speaker.name,
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            sermon.series?.let { series ->
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.List,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = series.title,
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                sermon.videoAsset?.hlsUrl?.let { videoUrl ->
                    FilledTonalButton(
                        onClick = { onPlayVideo(videoUrl) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Watch")
                    }
                }

                sermon.audioAsset?.downloadUrl?.let { audioUrl ->
                    FilledTonalButton(
                        onClick = { onPlayAudio(audioUrl) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Headset, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Listen")
                    }
                }
            }

            // Scripture References
            sermon.scriptureRefs?.takeIf { it.isNotEmpty() }?.let { scriptureRefs ->
                Card {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Scripture References",
                            style = MaterialTheme.typography.titleSmall
                        )
                        scriptureRefs.forEach { ref ->
                            Text(
                                text = "• $ref",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }
            }

            // Description
            sermon.description?.let { description ->
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Description",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = description,
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
            }

            // Tags
            sermon.tags?.takeIf { it.isNotEmpty() }?.let { tags ->
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Topics",
                        style = MaterialTheme.typography.titleSmall
                    )
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        tags.take(5).forEach { tag ->
                            AssistChip(
                                onClick = { },
                                label = { Text(tag.name) }
                            )
                        }
                    }
                }
            }
        }
    }
}
