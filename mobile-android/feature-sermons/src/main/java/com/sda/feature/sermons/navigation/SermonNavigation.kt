package com.sda.feature.sermons.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.sda.feature.devotionals.navigation.DevotionalDestinations
import com.sda.feature.quarterlies.navigation.QuarterlyDestinations
import com.sda.feature.sermons.presentation.detail.SermonDetailScreen
import com.sda.feature.sermons.presentation.home.HomeScreen
import com.sda.feature.sermons.presentation.list.SermonListScreen
import com.sda.feature.sermons.presentation.player.AudioPlayerScreen
import com.sda.feature.sermons.presentation.player.PlayerScreen
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

/**
 * Navigation routes for sermon feature
 */
object SermonDestinations {
    const val HOME_ROUTE = "home"
    const val SERMON_LIST_ROUTE = "sermons"
    const val SERMON_DETAIL_ROUTE = "sermons/{sermonId}"
    const val VIDEO_PLAYER_ROUTE = "player/video/{mediaUrl}"
    const val AUDIO_PLAYER_ROUTE = "player/audio/{mediaUrl}"

    fun sermonDetailRoute(sermonId: Long) = "sermons/$sermonId"
    fun videoPlayerRoute(mediaUrl: String): String {
        val encoded = URLEncoder.encode(mediaUrl, StandardCharsets.UTF_8.toString())
        return "player/video/$encoded"
    }
    fun audioPlayerRoute(mediaUrl: String): String {
        val encoded = URLEncoder.encode(mediaUrl, StandardCharsets.UTF_8.toString())
        return "player/audio/$encoded"
    }
}

/**
 * Add sermon feature navigation graph
 */
fun NavGraphBuilder.sermonGraph(navController: NavHostController) {
    // Home Screen
    composable(SermonDestinations.HOME_ROUTE) {
        HomeScreen(
            onSermonClick = { sermonId ->
                navController.navigate(SermonDestinations.sermonDetailRoute(sermonId))
            },
            onDevotionalClick = {
                navController.navigate(DevotionalDestinations.TODAY_ROUTE)
            },
            onQuarterlyClick = { quarterlyId ->
                navController.navigate(QuarterlyDestinations.lessonListRoute(quarterlyId))
            }
        )
    }

    // Sermon List Screen
    composable(SermonDestinations.SERMON_LIST_ROUTE) {
        SermonListScreen(
            onSermonClick = { sermonId ->
                navController.navigate(SermonDestinations.sermonDetailRoute(sermonId))
            },
            onBackClick = { navController.popBackStack() }
        )
    }

    // Sermon Detail Screen
    composable(
        route = SermonDestinations.SERMON_DETAIL_ROUTE,
        arguments = listOf(
            navArgument("sermonId") { type = NavType.LongType }
        )
    ) {
        SermonDetailScreen(
            onBackClick = { navController.popBackStack() },
            onPlayVideo = { videoUrl ->
                navController.navigate(SermonDestinations.videoPlayerRoute(videoUrl))
            },
            onPlayAudio = { audioUrl ->
                navController.navigate(SermonDestinations.audioPlayerRoute(audioUrl))
            }
        )
    }

    // Video Player Screen
    composable(
        route = SermonDestinations.VIDEO_PLAYER_ROUTE,
        arguments = listOf(
            navArgument("mediaUrl") { type = NavType.StringType }
        )
    ) { backStackEntry ->
        val mediaUrl = backStackEntry.arguments?.getString("mediaUrl") ?: return@composable
        PlayerScreen(
            mediaUrl = mediaUrl,
            onBackClick = { navController.popBackStack() }
        )
    }

    // Audio Player Screen
    composable(
        route = SermonDestinations.AUDIO_PLAYER_ROUTE,
        arguments = listOf(
            navArgument("mediaUrl") { type = NavType.StringType }
        )
    ) { backStackEntry ->
        val mediaUrl = backStackEntry.arguments?.getString("mediaUrl") ?: return@composable
        AudioPlayerScreen(
            mediaUrl = mediaUrl,
            onBackClick = { navController.popBackStack() }
        )
    }
}
