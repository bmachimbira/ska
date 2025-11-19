package com.sda.core.network.api

import com.sda.core.network.model.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Retrofit API service for the SDA Content App
 */
interface SDAApiService {

    // ========================================
    // Home
    // ========================================

    @GET("home")
    suspend fun getHome(): Response<HomeResponse>

    // ========================================
    // Sermons
    // ========================================

    @GET("sermons")
    suspend fun getSermons(
        @Query("search") search: String? = null,
        @Query("tag") tag: String? = null,
        @Query("series") series: Long? = null,
        @Query("speaker") speaker: Long? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Header("If-None-Match") etag: String? = null
    ): Response<SermonListResponse>

    @GET("sermons/{id}")
    suspend fun getSermon(
        @Path("id") id: Long,
        @Header("If-None-Match") etag: String? = null
    ): Response<SermonResponse>

    // ========================================
    // Devotionals
    // ========================================

    @GET("devotionals/today")
    suspend fun getTodayDevotional(
        @Query("tz") timezone: String = "UTC"
    ): Response<DevotionalResponse>

    @GET("devotionals")
    suspend fun getDevotionals(
        @Query("date") date: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<DevotionalListResponse>

    @GET("devotionals/{id}")
    suspend fun getDevotional(
        @Path("id") id: Long
    ): Response<DevotionalResponse>

    // ========================================
    // Quarterlies
    // ========================================

    @GET("quarterlies")
    suspend fun getQuarterlies(
        @Query("kind") kind: String? = null,
        @Query("lang") lang: String = "en"
    ): Response<QuarterlyListResponse>

    @GET("quarterlies/{id}")
    suspend fun getQuarterly(
        @Path("id") id: Long
    ): Response<QuarterlyResponse>

    @GET("quarterlies/{id}/lessons")
    suspend fun getLessons(
        @Path("id") quarterlyId: Long
    ): Response<LessonListResponse>

    @GET("lessons/{id}")
    suspend fun getLesson(
        @Path("id") id: Long
    ): Response<LessonResponse>

    @GET("lessons/{id}/days/{dayIndex}")
    suspend fun getLessonDay(
        @Path("id") lessonId: Long,
        @Path("dayIndex") dayIndex: Int
    ): Response<LessonDayResponse>

    // ========================================
    // Search
    // ========================================

    @GET("search")
    suspend fun search(
        @Query("q") query: String,
        @Query("page") page: Int = 1
    ): Response<SearchResponse>

    // ========================================
    // Chat
    // ========================================

    @POST("chat/query")
    suspend fun chatQuery(
        @Body request: ChatRequest
    ): Response<ChatResponse>
}
