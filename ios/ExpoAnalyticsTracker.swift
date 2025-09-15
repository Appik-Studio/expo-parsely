import Foundation
import ParselyAnalytics

// Helper class for managing Parsely analytics tracking
public class ExpoAnalyticsTracker {
  private static var shared: ExpoAnalyticsTracker?

  public static func sharedInstance() -> ExpoAnalyticsTracker {
    if shared == nil {
      shared = ExpoAnalyticsTracker()
    }
    return shared!
  }

  private var isConfigured = false
  private var currentEngagementUrl: String?

  private init() {}

  // MARK: - Configuration

  public func configure(siteId: String) {
    Parsely.sharedInstance.configure(siteId: siteId)
    isConfigured = true
  }

  public func getIsConfigured() -> Bool {
    return isConfigured
  }

  // MARK: - Page View Tracking

  public func trackPageView(
    url: String,
    urlref: String? = nil,
    metadata: ParselyMetadata? = nil,
    extraData: [String: Any]? = nil,
    siteId: String? = nil,
    action: String? = nil,
    data: [String: Any]? = nil
  ) {
    guard isConfigured else {
      print("ExpoParsely: Tracker not configured. Call configure() first.")
      return
    }

    Parsely.sharedInstance.trackPageView(
      url: url,
      urlref: urlref ?? "",
      metadata: metadata,
      extraData: extraData
    )
  }

  // MARK: - Engagement Tracking

  public func startEngagement(
    url: String,
    urlref: String? = nil,
    extraData: [String: Any]? = nil,
    siteId: String? = nil,
    action: String? = nil,
    data: [String: Any]? = nil
  ) {
    guard isConfigured else {
      print("ExpoParsely: Tracker not configured. Call configure() first.")
      return
    }

    Parsely.sharedInstance.startEngagement(
      url: url,
      urlref: urlref ?? "",
      extraData: extraData
    )
    currentEngagementUrl = url
  }

  public func stopEngagement() {
    Parsely.sharedInstance.stopEngagement()
    currentEngagementUrl = nil
  }

  public func getCurrentEngagementUrl() -> String? {
    return currentEngagementUrl
  }

  // MARK: - Conversion Tracking

  public func trackConversion(
    type: String,
    params: [String: Any]? = nil,
    url: String = "conversion://event"
  ) {
    guard isConfigured else {
      print("ExpoParsely: Tracker not configured. Call configure() first.")
      return
    }

    var extraData: [String: Any] = ["conversion_type": type]

    // Add common parameters
    if let plan = params?["plan"] as? String {
      extraData["plan"] = plan
    }
    if let accesibilityArticle = params?["accesibility_article"] as? Bool {
      extraData["accesibility_article"] = accesibilityArticle ? 1 : 0
    }
    if let spyriUserId = params?["spyri_user_id"] as? String {
      extraData["spyri_user_id"] = spyriUserId
    }

    // Add type-specific parameters
    if let additionalParams = params {
      for (key, value) in additionalParams {
        if !["plan", "accesibility_article", "spyri_user_id"].contains(key) {
          extraData[key] = value
        }
      }
    }

    Parsely.sharedInstance.trackPageView(
      url: url,
      metadata: ParselyMetadata(
        title: "Conversion: \(type)",
        section: "conversions"
      ),
      extraData: extraData
    )
  }

  // MARK: - Video Tracking

  public func trackVideoPlay(
    url: String,
    urlref: String? = nil,
    videoID: String,
    duration: TimeInterval,
    metadata: ParselyMetadata? = nil,
    extraData: [String: Any]? = nil,
    siteId: String? = nil,
    action: String? = nil,
    data: [String: Any]? = nil
  ) {
    guard isConfigured else {
      print("ExpoParsely: Tracker not configured. Call configure() first.")
      return
    }

    Parsely.sharedInstance.trackPlay(
      url: url,
      urlref: urlref ?? "",
      videoID: videoID,
      duration: duration,
      metadata: metadata,
      extraData: extraData
    )
  }

  public func trackVideoPause() {
    Parsely.sharedInstance.trackPause()
  }

  public func resetVideo(url: String, videoID: String) {
    Parsely.sharedInstance.resetVideo(url: url, videoID: videoID)
  }
}
