package com.sda.core.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_preferences")

/**
 * DataStore for user preferences
 */
class UserPreferencesDataStore(private val context: Context) {

    private object PreferencesKeys {
        val THEME_MODE = stringPreferencesKey("theme_mode")
        val ENABLE_NOTIFICATIONS = booleanPreferencesKey("enable_notifications")
        val AUTO_PLAY_SERMONS = booleanPreferencesKey("auto_play_sermons")
        val DOWNLOAD_OVER_WIFI_ONLY = booleanPreferencesKey("download_over_wifi_only")
        val TEXT_SIZE = stringPreferencesKey("text_size")
        val LAST_SYNC_TIME = longPreferencesKey("last_sync_time")
        val ENABLE_CHAT = booleanPreferencesKey("enable_chat")
    }

    val themeMode: Flow<String> = context.dataStore.data
        .map { preferences ->
            preferences[PreferencesKeys.THEME_MODE] ?: "system"
        }

    val enableNotifications: Flow<Boolean> = context.dataStore.data
        .map { preferences ->
            preferences[PreferencesKeys.ENABLE_NOTIFICATIONS] ?: true
        }

    val autoPlaySermons: Flow<Boolean> = context.dataStore.data
        .map { preferences ->
            preferences[PreferencesKeys.AUTO_PLAY_SERMONS] ?: false
        }

    val downloadOverWifiOnly: Flow<Boolean> = context.dataStore.data
        .map { preferences ->
            preferences[PreferencesKeys.DOWNLOAD_OVER_WIFI_ONLY] ?: true
        }

    val textSize: Flow<String> = context.dataStore.data
        .map { preferences ->
            preferences[PreferencesKeys.TEXT_SIZE] ?: "medium"
        }

    val lastSyncTime: Flow<Long> = context.dataStore.data
        .map { preferences ->
            preferences[PreferencesKeys.LAST_SYNC_TIME] ?: 0L
        }

    val enableChat: Flow<Boolean> = context.dataStore.data
        .map { preferences ->
            preferences[PreferencesKeys.ENABLE_CHAT] ?: false
        }

    suspend fun setThemeMode(mode: String) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.THEME_MODE] = mode
        }
    }

    suspend fun setEnableNotifications(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.ENABLE_NOTIFICATIONS] = enabled
        }
    }

    suspend fun setAutoPlaySermons(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.AUTO_PLAY_SERMONS] = enabled
        }
    }

    suspend fun setDownloadOverWifiOnly(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.DOWNLOAD_OVER_WIFI_ONLY] = enabled
        }
    }

    suspend fun setTextSize(size: String) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.TEXT_SIZE] = size
        }
    }

    suspend fun setLastSyncTime(time: Long) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.LAST_SYNC_TIME] = time
        }
    }

    suspend fun setEnableChat(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.ENABLE_CHAT] = enabled
        }
    }

    suspend fun clearAll() {
        context.dataStore.edit { it.clear() }
    }
}
