package com.sda.feature.devotionals.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.sda.feature.devotionals.presentation.list.DevotionalListScreen
import com.sda.feature.devotionals.presentation.today.TodayDevotionalScreen

/**
 * Navigation routes for devotional feature
 */
object DevotionalDestinations {
    const val TODAY_ROUTE = "devotionals/today"
    const val LIST_ROUTE = "devotionals/list"
    const val DETAIL_ROUTE = "devotionals/{devotionalId}"

    fun detailRoute(devotionalId: Long) = "devotionals/$devotionalId"
}

/**
 * Add devotional feature navigation graph
 */
fun NavGraphBuilder.devotionalGraph(navController: NavHostController) {
    // Today's Devotional Screen
    composable(DevotionalDestinations.TODAY_ROUTE) {
        TodayDevotionalScreen(
            onBackClick = { navController.popBackStack() },
            onArchiveClick = {
                navController.navigate(DevotionalDestinations.LIST_ROUTE)
            }
        )
    }

    // Devotional List/Archive Screen
    composable(DevotionalDestinations.LIST_ROUTE) {
        DevotionalListScreen(
            onDevotionalClick = { devotionalId ->
                navController.navigate(DevotionalDestinations.detailRoute(devotionalId))
            },
            onBackClick = { navController.popBackStack() }
        )
    }

    // Devotional Detail Screen (reuses Today's screen)
    composable(
        route = DevotionalDestinations.DETAIL_ROUTE,
        arguments = listOf(
            navArgument("devotionalId") { type = NavType.LongType }
        )
    ) {
        // For now, just show today's devotional screen
        // In a full implementation, you'd fetch the specific devotional by ID
        TodayDevotionalScreen(
            onBackClick = { navController.popBackStack() },
            onArchiveClick = {
                navController.navigate(DevotionalDestinations.LIST_ROUTE)
            }
        )
    }
}
