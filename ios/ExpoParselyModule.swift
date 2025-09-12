import ExpoModulesCore
import ParselyAnalytics
import Foundation

public class ExpoParselyModule: Module {
  // Enhanced activity tracking properties
  private var isHeartbeatActive = false
  private var heartbeatTimer: Timer?
  private var heartbeatIntervalMs: Int64 = 150000 // Parse.ly default: 150s
  private var inactivityThresholdMs: Int64 = 5000 // Parse.ly default: 5s
  private var maxDurationMs: Int64 = 3600000 // 1 hour max session
  private var lastActivityTime: Int64 = 0
  private var sessionStartTime: Int64 = 0
  private var totalActivities: Int64 = 0
  private var totalHeartbeats: Int64 = 0
  private var isScrolling = false

  // Video tracking state
  private var currentVideoUrl: String = ""
  private var currentVideoId: String = ""

  // Activity detection config
  private var enableTouchDetection = true
  private var enableScrollDetection = true
  private var touchThrottleMs: Int64 = 500
  private var scrollThrottleMs: Int64 = 2000

  // Component tracking registry
  private var componentTrackingRegistry: [String: [String: Any]] = [:]

  public func definition() -> ModuleDefinition {
    Name("ExpoParsely")

    Function("init") { (siteId: String, flushInterval: Int?, dryRun: Bool?) in
      do {
        Parsely.sharedInstance.configure(siteId: siteId)
        self.recordActivity() // Initialize activity tracking
      } catch {
        print("ExpoParsely init error: \(error.localizedDescription)")
      }
    }

    Function("trackPageView") { (url: String, urlRef: String?, metadata: [String: Any]?, extraData: [String: Any]?, siteId: String?) in
      do {
        guard let urlObj = URL(string: url) else {
          print("ExpoParsely: Invalid URL: \(url)")
          return
        }
        Parsely.sharedInstance.trackPageView(url: urlObj.absoluteString, urlref: urlRef ?? "")
        self.recordActivity()
      } catch {
        print("ExpoParsely trackPageView error: \(error.localizedDescription)")
      }
    }

    Function("startEngagement") { (url: String, urlRef: String?, extraData: [String: Any]?, siteId: String?) in
      do {
        guard let urlObj = URL(string: url) else {
          print("ExpoParsely: Invalid URL: \(url)")
          return
        }
        Parsely.sharedInstance.startEngagement(url: urlObj.absoluteString, urlref: urlRef ?? "", extraData: extraData, siteId: siteId ?? "")
        self.recordActivity()
        self.startHeartbeatTrackingInternal()
      } catch {
        print("ExpoParsely startEngagement error: \(error.localizedDescription)")
      }
    }

    Function("stopEngagement") {
      do {
        Parsely.sharedInstance.stopEngagement()
        self.stopHeartbeatTrackingInternal()
      } catch {
        print("ExpoParsely stopEngagement error: \(error.localizedDescription)")
      }
    }


    // Enhanced Heartbeat and Activity Detection Implementation
    Function("configureHeartbeat") { (config: [String: Any]) in
      config["inactivityThresholdMs"].flatMap { $0 as? Int64 }.map { self.inactivityThresholdMs = $0 }
      config["intervalMs"].flatMap { $0 as? Int64 }.map { self.heartbeatIntervalMs = $0 }
      config["maxDurationMs"].flatMap { $0 as? Int64 }.map { self.maxDurationMs = $0 }
    }

    Function("configureActivityDetection") { (config: [String: Any]) in
      config["enableTouchDetection"].flatMap { $0 as? Bool }.map { self.enableTouchDetection = $0 }
      config["enableScrollDetection"].flatMap { $0 as? Bool }.map { self.enableScrollDetection = $0 }
      config["touchThrottleMs"].flatMap { $0 as? Int64 }.map { self.touchThrottleMs = $0 }
      config["scrollThrottleMs"].flatMap { $0 as? Int64 }.map { self.scrollThrottleMs = $0 }
    }

    Function("recordActivity") {
      self.recordActivity()
    }



    Function("trackElement") { (action: String, elementType: String, elementId: String, location: String) in
      do {
        // Track element as custom page view URL
        let customUrlString = "https://app://element/\(elementId)?action=\(action)&type=\(elementType)&location=\(location)"
        guard let customUrl = URL(string: customUrlString) else {
          print("ExpoParsely: Invalid custom URL: \(customUrlString)")
          return
        }
        Parsely.sharedInstance.trackPageView(url: customUrl.absoluteString)
        self.recordActivity()
      } catch {
        print("ExpoParsely trackElement error: \(error.localizedDescription)")
      }
    }

    // Video tracking methods
    Function("trackPlay") { (url: String, videoMetadata: [String: Any], urlRef: String?, extraData: [String: Any]?, siteId: String?) in
      do {
        guard let urlObj = URL(string: url) else {
          print("ExpoParsely: Invalid URL: \(url)")
          return
        }
        let videoID = videoMetadata["videoId"] as? String ?? ""
        let duration = videoMetadata["duration"] as? TimeInterval ?? 0
        let metadata = ParselyMetadata(
          canonical_url: videoMetadata["canonical_url"] as? String,
          pub_date: videoMetadata["pub_date"] as? Date,
          title: videoMetadata["title"] as? String,
          authors: videoMetadata["authors"] as? [String],
          image_url: videoMetadata["image_url"] as? String,
          section: videoMetadata["section"] as? String,
          tags: videoMetadata["tags"] as? [String],
          duration: videoMetadata["duration"] as? TimeInterval
        )
        // Store current video state for resetVideo
        self.currentVideoUrl = urlObj.absoluteString
        self.currentVideoId = videoID

        Parsely.sharedInstance.trackPlay(url: urlObj.absoluteString, urlref: urlRef ?? "", videoID: videoID, duration: duration, metadata: metadata, extraData: extraData, siteId: siteId ?? "")
        self.recordActivity()
      } catch {
        print("ExpoParsely trackPlay error: \(error.localizedDescription)")
      }
    }

    Function("trackPause") {
      do {
        Parsely.sharedInstance.trackPause()
      } catch {
        print("ExpoParsely trackPause error: \(error.localizedDescription)")
      }
    }

    Function("resetVideo") {
      do {
        if !self.currentVideoUrl.isEmpty && !self.currentVideoId.isEmpty {
          Parsely.sharedInstance.resetVideo(url: self.currentVideoUrl, videoID: self.currentVideoId)
        }
      } catch {
        print("ExpoParsely resetVideo error: \(error.localizedDescription)")
      }
    }

    // Component tracking methods
    Function("registerComponentTracking") { (config: [String: Any]) -> String in
      return self.registerComponentTrackingInternal(config: config)
    }

    Function("unregisterComponentTracking") { (trackingId: String) in
      self.unregisterComponentTrackingInternal(trackingId: trackingId)
    }

    // Heartbeat status methods
    Function("getHeartbeatStatus") { () -> [String: Any] in
      return self.getHeartbeatStatusInternal()
    }

    Function("startHeartbeatTracking") {
      self.startHeartbeatTrackingInternal()
    }

    Function("stopHeartbeatTracking") {
      self.stopHeartbeatTrackingInternal()
    }

    // Scroll state methods
    Function("isCurrentlyScrolling") { () -> Bool in
      return self.isCurrentlyScrollingInternal()
    }

    Function("setScrollState") { (scrolling: Bool) in
      self.setScrollStateInternal(scrolling: scrolling)
    }
  }

  // MARK: - Private Methods

  private func recordActivity() {
    lastActivityTime = Int64(Date().timeIntervalSince1970 * 1000)
    totalActivities += 1
    #if DEBUG
    print("🎯 [ExpoParsely] Activity recorded - Total: \(totalActivities), Last activity: \(lastActivityTime)")
    #endif
  }

  private func checkHeartbeat() {
    guard isHeartbeatActive else { return }

    let currentTime = Int64(Date().timeIntervalSince1970 * 1000)
    let timeSinceActivity = currentTime - lastActivityTime
    let sessionDuration = currentTime - sessionStartTime

    #if DEBUG
    print("💓 [ExpoParsely] Heartbeat check - Time since activity: \(timeSinceActivity)ms, Session duration: \(sessionDuration)ms")
    #endif

    // Check if user has been inactive for too long
    if timeSinceActivity > inactivityThresholdMs {
      #if DEBUG
      print("💓 [ExpoParsely] Stopping heartbeat due to inactivity")
      #endif
      stopHeartbeatTrackingInternal()
      return
    }

    // Check if session has exceeded max duration
    if sessionDuration > maxDurationMs {
      #if DEBUG
      print("💓 [ExpoParsely] Stopping heartbeat due to max duration")
      #endif
      stopHeartbeatTrackingInternal()
      return
    }

    // Send heartbeat
    totalHeartbeats += 1
    #if DEBUG
    print("💓 [ExpoParsely] Heartbeat sent - Total: \(totalHeartbeats)")
    #endif
  }

  private func startHeartbeatTrackingInternal() {
    if self.isHeartbeatActive { return }

    self.isHeartbeatActive = true
    let currentTime = Int64(Date().timeIntervalSince1970 * 1000)
    self.sessionStartTime = currentTime
    self.lastActivityTime = currentTime

    let interval = TimeInterval(self.heartbeatIntervalMs) / 1000.0
    #if DEBUG
    print("💓 [ExpoParsely] Starting heartbeat tracking - Interval: \(interval)s, Inactivity threshold: \(inactivityThresholdMs)ms")
    #endif
    self.heartbeatTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { _ in
      self.checkHeartbeat()
    }
  }

  private func stopHeartbeatTrackingInternal() {
    isHeartbeatActive = false
    heartbeatTimer?.invalidate()
    heartbeatTimer = nil
  }

  private func getHeartbeatStatusInternal() -> [String: Any] {
    let currentTime = Int64(Date().timeIntervalSince1970 * 1000)
    return [
      "isActive": self.isHeartbeatActive,
      "lastActivity": self.lastActivityTime,
      "sessionDuration": currentTime - self.sessionStartTime,
      "totalActivities": self.totalActivities,
      "totalHeartbeats": self.totalHeartbeats
    ]
  }

  private func registerComponentTrackingInternal(config: [String: Any]) -> String {
    let trackingId = UUID().uuidString
    self.componentTrackingRegistry[trackingId] = config
    return trackingId
  }

  private func unregisterComponentTrackingInternal(trackingId: String) {
    self.componentTrackingRegistry.removeValue(forKey: trackingId)
  }

  private func setScrollStateInternal(scrolling: Bool) {
    if self.enableScrollDetection {
      self.isScrolling = scrolling
      if scrolling {
        self.recordActivity()
      }
    }
  }

  private func isCurrentlyScrollingInternal() -> Bool {
    return self.isScrolling
  }
}
