package expo.modules.parsely

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Context
import android.content.SharedPreferences
import android.os.Handler
import android.os.Looper
import java.util.concurrent.ConcurrentHashMap
import java.util.UUID
// import com.parsely.parselyandroid.ParselyTracker
// Note: Parsely SDK import commented out - add when SDK is available

class ExpoParselyModule : Module() {
  private var isHeartbeatActive = false
  private var heartbeatHandler: Handler? = null
  private var heartbeatRunnable: Runnable? = null
  private var heartbeatIntervalMs: Long = 150000 // Parse.ly default: 150s (2.5 minutes)
  private var inactivityThresholdMs: Long = 5000 // Parse.ly default: 5s (activeTimeout)
  private var maxDurationMs: Long = 3600000 // 1 hour max session
  private var lastActivityTime: Long = System.currentTimeMillis()
  private var sessionStartTime: Long = System.currentTimeMillis()
  private var totalActivities: Long = 0
  private var totalHeartbeats: Long = 0
  private var isScrolling = false
  
  // Activity detection config - aligned with Parse.ly methodology
  private var enableTouchDetection = true
  private var enableScrollDetection = true // Parse.ly: scroll events are engagement
  private var touchThrottleMs: Long = 500
  private var scrollThrottleMs: Long = 2000
  private var scrollThreshold: Int = 5
  
  // Component tracking registry
  private val componentTrackingRegistry = ConcurrentHashMap<String, Map<String, Any>>()
  
  override fun definition() = ModuleDefinition {
    Name("ExpoParsely")

    Function("init") { siteId: String, flushInterval: Int?, dryRun: Boolean? ->
      try {
        val context = requireNotNull(appContext.reactContext)
        val flushIntervalSeconds = flushInterval ?: 150 // Parse.ly default: 150s
        val isDryRun = dryRun ?: false
        
        // TODO: Replace with actual Parsely SDK call when available:
        // ParselyTracker.init(siteId, flushIntervalSeconds, context, isDryRun)
        println("ExpoParsely init: siteId=$siteId, flushInterval=$flushIntervalSeconds, dryRun=$isDryRun")
        recordActivity() // Initialize activity tracking
      } catch (e: Exception) {
        println("ExpoParsely init error: ${e.message}")
      }
    }

    Function("trackPageView") { url: String, urlRef: String?, metadata: Map<String, Any>?, extraData: Map<String, Any>?, siteId: String? ->
      try {
        // TODO: Replace with actual Parsely SDK call when available:
        // ParselyTracker.sharedInstance.trackURL(url, urlRef)
        println("ExpoParsely trackPageView: url=$url, urlRef=$urlRef")
        recordActivity()
      } catch (e: Exception) {
        println("ExpoParsely trackPageView error: ${e.message}")
      }
    }

    Function("startEngagement") { url: String, urlRef: String?, extraData: Map<String, Any>?, siteId: String? ->
      try {
        // TODO: Replace with actual Parsely SDK call when available:
        // ParselyTracker.sharedInstance.startEngagement(url, urlRef)
        println("ExpoParsely startEngagement: url=$url, urlRef=$urlRef")
        recordActivity()
        startHeartbeatTrackingInternal()
      } catch (e: Exception) {
        println("ExpoParsely startEngagement error: ${e.message}")
      }
    }

    Function("stopEngagement") {
      try {
        // TODO: Replace with actual Parsely SDK call when available:
        // ParselyTracker.sharedInstance.stopEngagement()
        println("ExpoParsely stopEngagement")
        stopHeartbeatTrackingInternal()
      } catch (e: Exception) {
        println("ExpoParsely stopEngagement error: ${e.message}")
      }
    }


    // Enhanced Heartbeat and Activity Detection Implementation
    Function("configureHeartbeat") { config: Map<String, Any> ->
      config["enableHeartbeats"]?.let { 
        // Configuration is stored but heartbeat enabling is handled by start/stop methods
      }
      config["inactivityThresholdMs"]?.let { 
        inactivityThresholdMs = (it as? Number)?.toLong() ?: inactivityThresholdMs
      }
      config["intervalMs"]?.let { 
        heartbeatIntervalMs = (it as? Number)?.toLong() ?: heartbeatIntervalMs
      }
      config["maxDurationMs"]?.let { 
        maxDurationMs = (it as? Number)?.toLong() ?: maxDurationMs
      }
    }

    Function("configureActivityDetection") { config: Map<String, Any> ->
      config["enableTouchDetection"]?.let { 
        enableTouchDetection = it as? Boolean ?: enableTouchDetection
      }
      config["enableScrollDetection"]?.let { 
        enableScrollDetection = it as? Boolean ?: enableScrollDetection
      }
      config["touchThrottleMs"]?.let { 
        touchThrottleMs = (it as? Number)?.toLong() ?: touchThrottleMs
      }
      config["scrollThrottleMs"]?.let { 
        scrollThrottleMs = (it as? Number)?.toLong() ?: scrollThrottleMs
      }
      config["scrollThreshold"]?.let { 
        scrollThreshold = (it as? Number)?.toInt() ?: scrollThreshold
      }
    }

    Function("recordActivity") {
      recordActivity()
    }


    // Element and Component Tracking Implementation
    Function("trackElement") { action: String, elementType: String, elementId: String, location: String ->
      try {
        // TODO: Replace with actual Parsely SDK call when available:
        // ParselyTracker.sharedInstance.trackURL(customUrl)
        println("ExpoParsely trackElement: $action on $elementType#$elementId at $location")
        recordActivity() // Record this as user activity
      } catch (e: Exception) {
        println("ExpoParsely trackElement error: ${e.message}")
      }
    }


  }
  
  private fun startHeartbeatTrackingInternal() {
    if (isHeartbeatActive) return
    
    isHeartbeatActive = true
    sessionStartTime = System.currentTimeMillis()
    lastActivityTime = System.currentTimeMillis()
    
    heartbeatHandler = Handler(Looper.getMainLooper())
    heartbeatRunnable = object : Runnable {
      override fun run() {
        if (!isHeartbeatActive) return
        
        val currentTime = System.currentTimeMillis()
        val timeSinceActivity = currentTime - lastActivityTime
        val sessionDuration = currentTime - sessionStartTime
        
        // Check if user has been inactive for too long
        if (timeSinceActivity > inactivityThresholdMs) {
          stopHeartbeatTrackingInternal()
          return
        }
        
        // Check if session has exceeded max duration
        if (sessionDuration > maxDurationMs) {
          stopHeartbeatTrackingInternal()
          return
        }
        
        // Send heartbeat (could be implemented as a custom event if needed)
        totalHeartbeats++
        
        // Schedule next heartbeat
        heartbeatHandler?.postDelayed(this, heartbeatIntervalMs)
      }
    }
    
    heartbeatHandler?.postDelayed(heartbeatRunnable!!, heartbeatIntervalMs)
  }
  
  private fun stopHeartbeatTrackingInternal() {
    isHeartbeatActive = false
    heartbeatRunnable?.let { heartbeatHandler?.removeCallbacks(it) }
    heartbeatHandler = null
    heartbeatRunnable = null
  }
  
  private fun recordActivity() {
    lastActivityTime = System.currentTimeMillis()
    totalActivities++
  }
  
  private fun getHeartbeatStatusInternal(): Map<String, Any> {
    return mapOf(
      "isActive" to isHeartbeatActive,
      "lastActivity" to lastActivityTime,
      "sessionDuration" to (System.currentTimeMillis() - sessionStartTime),
      "totalActivities" to totalActivities,
      "totalHeartbeats" to totalHeartbeats
    )
  }
  
  private fun registerComponentTrackingInternal(config: Map<String, Any>): String {
    val trackingId = UUID.randomUUID().toString()
    componentTrackingRegistry[trackingId] = config
    return trackingId
  }
  
  private fun unregisterComponentTrackingInternal(trackingId: String) {
    componentTrackingRegistry.remove(trackingId)
  }
  
  private fun setScrollStateInternal(scrolling: Boolean) {
    if (enableScrollDetection) {
      isScrolling = scrolling
      if (scrolling) {
        recordActivity() // Parse.ly methodology: scroll = engagement
      }
    }
  }
  
  private fun isCurrentlyScrollingInternal(): Boolean {
    return isScrolling
  }
  
  private fun getPreferences(): SharedPreferences {
    val context = requireNotNull(appContext.reactContext)
    return context.getSharedPreferences("expo_parsely_preferences", Context.MODE_PRIVATE)
  }
}
