package com.sda.feature.quarterlies.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.sda.feature.quarterlies.presentation.day.LessonDayScreen
import com.sda.feature.quarterlies.presentation.lesson.LessonListScreen
import com.sda.feature.quarterlies.presentation.list.QuarterlyListScreen

/**
 * Navigation destinations for Quarterly feature
 */
object QuarterlyDestinations {
    const val QUARTERLY_LIST_ROUTE = "quarterlies"
    const val LESSON_LIST_ROUTE = "quarterlies/{quarterlyId}/lessons"
    const val LESSON_DAY_ROUTE = "lessons/{lessonId}/days/{dayIndex}"

    fun lessonListRoute(quarterlyId: Long) = "quarterlies/$quarterlyId/lessons"
    fun lessonDayRoute(lessonId: Long, dayIndex: Int) = "lessons/$lessonId/days/$dayIndex"
}

/**
 * Navigation graph for Quarterly feature
 */
fun NavGraphBuilder.quarterlyGraph(navController: NavHostController) {
    // Quarterly list screen
    composable(QuarterlyDestinations.QUARTERLY_LIST_ROUTE) {
        QuarterlyListScreen(
            onQuarterlyClick = { quarterlyId ->
                navController.navigate(QuarterlyDestinations.lessonListRoute(quarterlyId))
            },
            onBackClick = {
                navController.navigateUp()
            }
        )
    }

    // Lesson list screen
    composable(
        route = QuarterlyDestinations.LESSON_LIST_ROUTE,
        arguments = listOf(
            navArgument("quarterlyId") { type = NavType.LongType }
        )
    ) {
        LessonListScreen(
            onLessonClick = { lessonId ->
                // Navigate to first day of the lesson
                navController.navigate(QuarterlyDestinations.lessonDayRoute(lessonId, 1))
            },
            onBackClick = {
                navController.navigateUp()
            }
        )
    }

    // Lesson day screen
    composable(
        route = QuarterlyDestinations.LESSON_DAY_ROUTE,
        arguments = listOf(
            navArgument("lessonId") { type = NavType.LongType },
            navArgument("dayIndex") { type = NavType.IntType }
        )
    ) { backStackEntry ->
        val lessonId = backStackEntry.arguments?.getLong("lessonId") ?: 0L
        val currentDayIndex = backStackEntry.arguments?.getInt("dayIndex") ?: 1

        LessonDayScreen(
            onBackClick = {
                navController.navigateUp()
            },
            onPreviousDay = if (currentDayIndex > 1) {
                {
                    navController.navigate(
                        QuarterlyDestinations.lessonDayRoute(lessonId, currentDayIndex - 1)
                    ) {
                        // Replace current destination to avoid stack buildup
                        popUpTo(QuarterlyDestinations.lessonDayRoute(lessonId, currentDayIndex)) {
                            inclusive = true
                        }
                    }
                }
            } else null,
            onNextDay = if (currentDayIndex < 7) {
                {
                    navController.navigate(
                        QuarterlyDestinations.lessonDayRoute(lessonId, currentDayIndex + 1)
                    ) {
                        // Replace current destination to avoid stack buildup
                        popUpTo(QuarterlyDestinations.lessonDayRoute(lessonId, currentDayIndex)) {
                            inclusive = true
                        }
                    }
                }
            } else null
        )
    }
}
