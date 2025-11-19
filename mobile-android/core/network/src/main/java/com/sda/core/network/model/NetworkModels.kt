package com.sda.core.network.model

import com.google.gson.annotations.SerializedName

// ========================================
// Home
// ========================================

data class HomeResponse(
    @SerializedName("featuredSermons") val featuredSermons: List<SermonSummary>,
    @SerializedName("todayDevotional") val todayDevotional: DevotionalSummary?,
    @SerializedName("currentQuarterlies") val currentQuarterlies: List<QuarterlySummary>
)

// ========================================
// Sermons
// ========================================

data class SermonListResponse(
    @SerializedName("sermons") val sermons: List<SermonSummary>,
    @SerializedName("pagination") val pagination: Pagination
)

data class SermonResponse(
    @SerializedName("id") val id: Long,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String?,
    @SerializedName("scriptureRefs") val scriptureRefs: List<String>?,
    @SerializedName("speaker") val speaker: Speaker?,
    @SerializedName("series") val series: Series?,
    @SerializedName("videoAsset") val videoAsset: MediaAsset?,
    @SerializedName("audioAsset") val audioAsset: MediaAsset?,
    @SerializedName("thumbnailAsset") val thumbnailAsset: MediaAsset?,
    @SerializedName("publishedAt") val publishedAt: String?,
    @SerializedName("isFeatured") val isFeatured: Boolean,
    @SerializedName("tags") val tags: List<Tag>?
)

data class SermonSummary(
    @SerializedName("id") val id: Long,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String?,
    @SerializedName("thumbnailUrl") val thumbnailUrl: String?,
    @SerializedName("speaker") val speaker: SpeakerSummary?,
    @SerializedName("publishedAt") val publishedAt: String?
)

data class Speaker(
    @SerializedName("id") val id: Long,
    @SerializedName("name") val name: String,
    @SerializedName("bio") val bio: String?
)

data class SpeakerSummary(
    @SerializedName("id") val id: Long,
    @SerializedName("name") val name: String
)

data class Series(
    @SerializedName("id") val id: Long,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String?
)

data class Tag(
    @SerializedName("id") val id: Long,
    @SerializedName("slug") val slug: String,
    @SerializedName("name") val name: String
)

// ========================================
// Devotionals
// ========================================

data class DevotionalListResponse(
    @SerializedName("devotionals") val devotionals: List<DevotionalSummary>,
    @SerializedName("pagination") val pagination: Pagination
)

data class DevotionalResponse(
    @SerializedName("id") val id: Long,
    @SerializedName("slug") val slug: String,
    @SerializedName("title") val title: String,
    @SerializedName("author") val author: String?,
    @SerializedName("bodyMd") val bodyMd: String,
    @SerializedName("date") val date: String,
    @SerializedName("audioAsset") val audioAsset: MediaAsset?
)

data class DevotionalSummary(
    @SerializedName("id") val id: Long,
    @SerializedName("title") val title: String,
    @SerializedName("author") val author: String?,
    @SerializedName("date") val date: String,
    @SerializedName("excerpt") val excerpt: String?
)

// ========================================
// Quarterlies
// ========================================

data class QuarterlyListResponse(
    @SerializedName("quarterlies") val quarterlies: List<QuarterlySummary>
)

data class QuarterlyResponse(
    @SerializedName("id") val id: Long,
    @SerializedName("kind") val kind: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String?,
    @SerializedName("year") val year: Int,
    @SerializedName("quarter") val quarter: Int,
    @SerializedName("lang") val lang: String
)

data class QuarterlySummary(
    @SerializedName("id") val id: Long,
    @SerializedName("kind") val kind: String,
    @SerializedName("title") val title: String,
    @SerializedName("year") val year: Int,
    @SerializedName("quarter") val quarter: Int
)

data class LessonListResponse(
    @SerializedName("lessons") val lessons: List<LessonSummary>
)

data class LessonResponse(
    @SerializedName("id") val id: Long,
    @SerializedName("quarterlyId") val quarterlyId: Long,
    @SerializedName("indexInQuarter") val indexInQuarter: Int,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String?,
    @SerializedName("days") val days: List<LessonDaySummary>?
)

data class LessonSummary(
    @SerializedName("id") val id: Long,
    @SerializedName("indexInQuarter") val indexInQuarter: Int,
    @SerializedName("title") val title: String
)

data class LessonDayResponse(
    @SerializedName("id") val id: Long,
    @SerializedName("lessonId") val lessonId: Long,
    @SerializedName("dayIndex") val dayIndex: Int,
    @SerializedName("date") val date: String?,
    @SerializedName("title") val title: String,
    @SerializedName("bodyMd") val bodyMd: String,
    @SerializedName("memoryVerse") val memoryVerse: String?,
    @SerializedName("audioAsset") val audioAsset: MediaAsset?
)

data class LessonDaySummary(
    @SerializedName("id") val id: Long,
    @SerializedName("dayIndex") val dayIndex: Int,
    @SerializedName("title") val title: String
)

// ========================================
// Media
// ========================================

data class MediaAsset(
    @SerializedName("id") val id: String,
    @SerializedName("kind") val kind: String,
    @SerializedName("hlsUrl") val hlsUrl: String?,
    @SerializedName("dashUrl") val dashUrl: String?,
    @SerializedName("downloadUrl") val downloadUrl: String?,
    @SerializedName("width") val width: Int?,
    @SerializedName("height") val height: Int?,
    @SerializedName("durationSeconds") val durationSeconds: Int?
)

// ========================================
// Search
// ========================================

data class SearchResponse(
    @SerializedName("results") val results: List<SearchResult>,
    @SerializedName("query") val query: String,
    @SerializedName("pagination") val pagination: Pagination
)

data class SearchResult(
    @SerializedName("type") val type: String,
    @SerializedName("id") val id: Long,
    @SerializedName("title") val title: String,
    @SerializedName("snippet") val snippet: String?
)

// ========================================
// Chat
// ========================================

data class ChatQueryRequest(
    @SerializedName("query") val query: String,
    @SerializedName("mode") val mode: String = "general",
    @SerializedName("filter") val filter: Map<String, Any>? = null,
    @SerializedName("stream") val stream: Boolean = false,
    @SerializedName("conversationHistory") val conversationHistory: List<Map<String, String>> = emptyList()
)

data class ChatResponse(
    @SerializedName("answer") val answer: String,
    @SerializedName("sources") val sources: List<ChatSource>
)

data class ChatSource(
    @SerializedName("index") val index: Int,
    @SerializedName("source") val source: String,
    @SerializedName("metadata") val metadata: Map<String, Any>
)

// ========================================
// Common
// ========================================

data class Pagination(
    @SerializedName("page") val page: Int,
    @SerializedName("limit") val limit: Int,
    @SerializedName("total") val total: Int,
    @SerializedName("pages") val pages: Int
)
