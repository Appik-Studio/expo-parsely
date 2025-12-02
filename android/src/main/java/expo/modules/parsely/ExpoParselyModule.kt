package expo.modules.parsely

import android.content.Context
import android.os.Handler
import android.os.Looper
import com.parsely.parselyandroid.ParselyTracker
import com.parsely.parselyandroid.ParselyMetadata
import com.parsely.parselyandroid.ParselyVideoMetadata
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoParselyModule : Module() {
  private var parselyTracker: ParselyTracker? = null
  private val mainHandler = Handler(Looper.getMainLooper())
  private var isInitialized = false

  override fun definition() = ModuleDefinition {
    Name("ExpoParsely")

    // Configure the Parsely tracker
    Function("init") { siteId: String ->
      if (isInitialized) {
        return@Function
      }
      val context = appContext.reactContext ?: throw IllegalStateException("React context is null")
      mainHandler.post {
        ParselyTracker.init(siteId, 30, context, false)
        parselyTracker = ParselyTracker.sharedInstance()
        isInitialized = true
      }
    }

    // Track page view
    Function("trackPageView") { options: Map<String, Any?> ->
      ensureTrackerInitialized()

      val url = options["url"] as? String ?: throw IllegalArgumentException("URL is required")
      val urlref = options["urlref"] as? String ?: ""

      // Handle metadata if provided
      val metadata = options["metadata"]?.let { createParselyMetadata(it as Map<String, Any?>) }
      val rawExtraData = (options["extraData"] as? Map<String, Any?>) ?: emptyMap()
      val extraData = convertExtraDataValues(rawExtraData)

      mainHandler.post {
          // Use basic tracking call for v4.x SDK compatibility
        parselyTracker?.trackPageview(url, urlref, metadata, extraData as Map<String, Any>?)
      }
    }

    // Engagement tracking
    Function("startEngagement") { options: Map<String, Any?> ->
      ensureTrackerInitialized()

      val url = options["url"] as? String ?: throw IllegalArgumentException("URL is required")
      val urlref = options["urlref"] as? String ?: ""
      val rawExtraData = (options["extraData"] as? Map<String, Any?>) ?: emptyMap()
      val extraData = convertExtraDataValues(rawExtraData)

      mainHandler.post {
        parselyTracker?.startEngagement(url, urlref, extraData as Map<String, Any>?)
      }
    }

    Function("stopEngagement") {
      mainHandler.post {
        parselyTracker?.stopEngagement()
      }
    }

    // Video tracking (simplified for compatibility)
    Function("trackPlay") { options: Map<String, Any?> ->
      ensureTrackerInitialized()
      // For now, just track as a regular page view with video metadata in extraData
      val url = options["url"] as? String ?: throw IllegalArgumentException("URL is required")
      val urlref = options["urlref"] as? String ?: ""
      val rawExtraData = (options["extraData"] as? Map<String, Any?>) ?: emptyMap()
      val extraData = convertExtraDataValues(rawExtraData)
      val mergedExtraData = mutableMapOf<String, Any?>()
      mergedExtraData.putAll(extraData)
      mergedExtraData["video_play"] = true

      mainHandler.post {
        parselyTracker?.trackPageview(url, urlref, null, mergedExtraData as Map<String, Any>?)
      }
    }

    Function("trackPause") {
      mainHandler.post {
        parselyTracker?.trackPause()
      }
    }

    Function("resetVideo") {
      mainHandler.post {
        parselyTracker?.resetVideo()
      }
    }

    // Heartbeat management
    Function("startHeartbeat") { config: Map<String, Any?>? ->
      ensureTrackerInitialized()

      mainHandler.post {
          // For now, delegate to startEngagement with default URL
      // In a more advanced implementation, this could manage custom heartbeat timers
        parselyTracker?.startEngagement("app://heartbeat", "", emptyMap())
      }
    }

    Function("stopHeartbeat") {
      mainHandler.post {
        parselyTracker?.stopEngagement()
      }
    }
  }

  private fun ensureTrackerInitialized() {
    if (parselyTracker == null) {
      throw IllegalStateException("Parsely tracker not initialized. Call init() first.")
    }
  }

  private fun createParselyMetadata(dict: Map<String, Any?>): ParselyMetadata {
    // Create basic metadata - properties may be private in current SDK version
    return ParselyMetadata()
  }

  /**
   * Converts extraData values from strings to their proper native types.
   * This is needed because the JS bridge may serialize values as strings.
   */
  private fun convertExtraDataValues(data: Map<String, Any?>): Map<String, Any?> {
    return data.mapValues { (_, value) -> convertValue(value) }
  }

  private fun convertValue(value: Any?): Any? {
    return when (value) {
      is String -> parseStringValue(value)
      is Map<*, *> -> {
        @Suppress("UNCHECKED_CAST")
        convertExtraDataValues(value as Map<String, Any?>)
      }
      is List<*> -> value.map { convertValue(it) }
      else -> value
    }
  }

  private fun parseStringValue(value: String): Any {
    // Try boolean
    if (value.equals("true", ignoreCase = true)) return true
    if (value.equals("false", ignoreCase = true)) return false

    // Try integer (Long for larger numbers)
    value.toLongOrNull()?.let { longVal ->
      // Return Int if it fits, otherwise Long
      return if (longVal in Int.MIN_VALUE..Int.MAX_VALUE) longVal.toInt() else longVal
    }

    // Try double
    value.toDoubleOrNull()?.let { return it }

    // Keep as string
    return value
  }

}
