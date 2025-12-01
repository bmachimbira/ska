package com.sda.app.util

import android.content.Intent
import android.net.Uri
import androidx.navigation.NavController
import com.sda.feature.devotionals.navigation.DevotionalDestinations
import com.sda.feature.quarterlies.navigation.QuarterlyDestinations
import com.sda.feature.sermons.navigation.SermonDestinations
import com.sda.feature.chat.navigation.ChatDestinations

/**
 * Handles deep links and navigates to appropriate destinations
 */
object DeepLinkHandler {

    /**
     * Handle incoming deep link intent
     * Returns true if the deep link was handled
     */
    fun handleDeepLink(intent: Intent?, navController: NavController): Boolean {
        val data: Uri = intent?.data ?: return false

        return when {
            // Sermon deep links
            // https://sda-content.app/sermons/{id}
            // sdacontent://sermons/{id}
            data.pathSegments?.firstOrNull() == "sermons" -> {
                handleSermonDeepLink(data, navController)
            }

            // Devotional deep links
            // https://sda-content.app/devotionals/today
            // https://sda-content.app/devotionals/{id}
            data.pathSegments?.firstOrNull() == "devotionals" -> {
                handleDevotionalDeepLink(data, navController)
            }

            // Quarterly deep links
            // https://sda-content.app/sabbath-school/{id}
            // https://sda-content.app/sabbath-school/lessons/{lessonId}
            data.pathSegments?.firstOrNull() == "sabbath-school" -> {
                handleQuarterlyDeepLink(data, navController)
            }

            // Chat deep links
            // https://sda-content.app/chat
            // https://sda-content.app/chat?quarterlyId={id}
            data.pathSegments?.firstOrNull() == "chat" -> {
                handleChatDeepLink(data, navController)
            }

            else -> false
        }
    }

    private fun handleSermonDeepLink(data: Uri, navController: NavController): Boolean {
        val segments = data.pathSegments
        return when {
            // /sermons/{id}
            segments?.size == 2 -> {
                val sermonId = segments[1].toLongOrNull() ?: return false
                navController.navigate(SermonDestinations.sermonDetailRoute(sermonId))
                true
            }
            // /sermons (list)
            segments?.size == 1 -> {
                navController.navigate(SermonDestinations.SERMON_LIST_ROUTE)
                true
            }
            else -> false
        }
    }

    private fun handleDevotionalDeepLink(data: Uri, navController: NavController): Boolean {
        val segments = data.pathSegments
        return when {
            // /devotionals/today
            segments?.size == 2 && segments[1] == "today" -> {
                navController.navigate(DevotionalDestinations.TODAY_ROUTE)
                true
            }
            // /devotionals/{id}
            segments?.size == 2 -> {
                val devotionalId = segments[1].toLongOrNull() ?: return false
                navController.navigate(DevotionalDestinations.detailRoute(devotionalId))
                true
            }
            // /devotionals (list)
            segments?.size == 1 -> {
                navController.navigate(DevotionalDestinations.LIST_ROUTE)
                true
            }
            else -> false
        }
    }

    private fun handleQuarterlyDeepLink(data: Uri, navController: NavController): Boolean {
        val segments = data.pathSegments
        return when {
            // /sabbath-school/lessons/{lessonId}/days/{dayIndex}
            segments?.size == 5 && segments[1] == "lessons" && segments[3] == "days" -> {
                val lessonId = segments[2].toLongOrNull() ?: return false
                val dayIndex = segments[4].toIntOrNull() ?: return false
                navController.navigate(QuarterlyDestinations.lessonDayRoute(lessonId, dayIndex))
                true
            }
            // /sabbath-school/lessons/{lessonId}
            segments?.size == 3 && segments[1] == "lessons" -> {
                val lessonId = segments[2].toLongOrNull() ?: return false
                // Navigate to first day of lesson
                navController.navigate(QuarterlyDestinations.lessonDayRoute(lessonId, 1))
                true
            }
            // /sabbath-school/{id}
            segments?.size == 2 -> {
                val quarterlyId = segments[1].toLongOrNull() ?: return false
                navController.navigate(QuarterlyDestinations.lessonListRoute(quarterlyId))
                true
            }
            // /sabbath-school (list)
            segments?.size == 1 -> {
                navController.navigate(QuarterlyDestinations.QUARTERLY_LIST_ROUTE)
                true
            }
            else -> false
        }
    }

    private fun handleChatDeepLink(data: Uri, navController: NavController): Boolean {
        // Get quarterly ID from query parameter if present
        val quarterlyId = data.getQueryParameter("quarterlyId")?.toLongOrNull()

        navController.navigate(
            if (quarterlyId != null) {
                ChatDestinations.chatWithQuarterlyRoute(quarterlyId)
            } else {
                ChatDestinations.CHAT_ROUTE
            }
        )
        return true
    }

    /**
     * Generate shareable deep link for a sermon
     */
    fun generateSermonLink(sermonId: Long): String {
        return "https://sda-content.app/sermons/$sermonId"
    }

    /**
     * Generate shareable deep link for today's devotional
     */
    fun generateTodayDevotionalLink(): String {
        return "https://sda-content.app/devotionals/today"
    }

    /**
     * Generate shareable deep link for a devotional
     */
    fun generateDevotionalLink(devotionalId: Long): String {
        return "https://sda-content.app/devotionals/$devotionalId"
    }

    /**
     * Generate shareable deep link for a quarterly
     */
    fun generateQuarterlyLink(quarterlyId: Long): String {
        return "https://sda-content.app/sabbath-school/$quarterlyId"
    }

    /**
     * Generate shareable deep link for a lesson day
     */
    fun generateLessonDayLink(quarterlyId: Long, lessonId: Long, dayIndex: Int): String {
        return "https://sda-content.app/sabbath-school/lessons/$lessonId/days/$dayIndex"
    }

    /**
     * Generate shareable deep link for chat
     */
    fun generateChatLink(quarterlyId: Long? = null): String {
        return if (quarterlyId != null) {
            "https://sda-content.app/chat?quarterlyId=$quarterlyId"
        } else {
            "https://sda-content.app/chat"
        }
    }
}
