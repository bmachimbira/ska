package com.sda.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.rememberNavController

/**
 * Main navigation host for the SDA app
 * Manages navigation between different features
 */
@Composable
fun SDANavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
    startDestination: String = NavigationRoutes.HOME
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        // TODO: Add navigation destinations
        // homeScreen(navController)
        // sermonsScreen(navController)
        // devotionalsScreen(navController)
        // quarterliesScreen(navController)
    }
}

/**
 * Navigation routes for the app
 */
object NavigationRoutes {
    const val HOME = "home"
    const val SERMONS = "sermons"
    const val SERMONS_DETAIL = "sermons/{sermonId}"
    const val DEVOTIONALS = "devotionals"
    const val DEVOTIONALS_DETAIL = "devotionals/{devotionalId}"
    const val QUARTERLIES = "quarterlies"
    const val QUARTERLIES_DETAIL = "quarterlies/{quarterlyId}"
    const val PLAYER = "player/{mediaUrl}"
}
