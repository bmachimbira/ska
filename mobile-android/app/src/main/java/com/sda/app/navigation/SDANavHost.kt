package com.sda.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.rememberNavController
import com.sda.feature.devotionals.navigation.devotionalGraph
import com.sda.feature.quarterlies.navigation.quarterlyGraph
import com.sda.feature.sermons.navigation.SermonDestinations
import com.sda.feature.sermons.navigation.sermonGraph

/**
 * Main navigation host for the SDA app
 * Manages navigation between different features
 */
@Composable
fun SDANavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
    startDestination: String = SermonDestinations.HOME_ROUTE
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        // Sermon feature (includes Home screen)
        sermonGraph(navController)

        // Devotional feature
        devotionalGraph(navController)

        // Quarterly feature
        quarterlyGraph(navController)

        // TODO: Add chat feature navigation graph
        // chatGraph(navController)
    }
}
