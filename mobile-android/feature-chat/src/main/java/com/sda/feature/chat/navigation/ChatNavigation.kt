package com.sda.feature.chat.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.sda.feature.chat.presentation.ChatScreen

/**
 * Navigation destinations for Chat feature
 */
object ChatDestinations {
    const val CHAT_ROUTE = "chat"
    const val CHAT_WITH_QUARTERLY_ROUTE = "chat?quarterlyId={quarterlyId}"

    fun chatWithQuarterlyRoute(quarterlyId: Long) = "chat?quarterlyId=$quarterlyId"
}

/**
 * Navigation graph for Chat feature
 */
fun NavGraphBuilder.chatGraph(navController: NavHostController) {
    // Chat screen
    composable(
        route = ChatDestinations.CHAT_WITH_QUARTERLY_ROUTE,
        arguments = listOf(
            navArgument("quarterlyId") {
                type = NavType.LongType
                nullable = true
                defaultValue = null
            }
        )
    ) { backStackEntry ->
        val quarterlyId = backStackEntry.arguments?.getLong("quarterlyId")?.takeIf { it != 0L }

        ChatScreen(
            onBackClick = {
                navController.navigateUp()
            },
            quarterlyId = quarterlyId
        )
    }

    // Simple chat route without quarterly context
    composable(ChatDestinations.CHAT_ROUTE) {
        ChatScreen(
            onBackClick = {
                navController.navigateUp()
            }
        )
    }
}
