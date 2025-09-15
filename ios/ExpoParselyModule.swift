import ExpoModulesCore
import ParselyAnalytics

public class ExpoParselyModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoParsely")

    // Configure the Parsely tracker
    Function("init") { (siteId: String) in
      Parsely.sharedInstance.configure(siteId: siteId)
    }

    // Track page view
    Function("trackPageView") { (options: [String: Any]) in
      if let url = options["url"] as? String {
        let urlref = options["urlref"] as? String
        let siteId = options["siteId"] as? String

        // Handle metadata if provided
        var metadata: ParselyMetadata?
        if let metadataDict = options["metadata"] as? [String: Any] {
          metadata = createParselyMetadata(from: metadataDict)
        }

        // Handle extra data
        let extraData = options["extraData"] as? [String: Any]

        Parsely.sharedInstance.trackPageView(
          url: url,
          urlref: urlref ?? "",
          metadata: metadata,
          extraData: extraData
        )
      } else {
        // Handle case where options is not a dictionary
        print("ExpoParsely: Invalid options format")
      }
    }

    // Engagement tracking
    Function("startEngagement") { (options: [String: Any]) in
      if let url = options["url"] as? String {
        let urlref = options["urlref"] as? String
        let extraData = options["extraData"] as? [String: Any]
        let siteId = options["siteId"] as? String

        Parsely.sharedInstance.startEngagement(
          url: url,
          urlref: urlref ?? "",
          extraData: extraData
        )
      }
    }

    Function("stopEngagement") {
      Parsely.sharedInstance.stopEngagement()
    }

    // Conversion tracking is handled through trackPageView with conversion URLs
    // Use URLs like 'conversion://lead_capture', 'conversion://newsletter_signup', etc.
    // Include conversion parameters in extraData

    // Video tracking
    Function("trackPlay") { (options: [String: Any]) in
      if let url = options["url"] as? String,
         let videoID = options["videoID"] as? String,
         let duration = options["duration"] as? Double {

        let urlref = options["urlref"] as? String
        let siteId = options["siteId"] as? String

        var metadata: ParselyMetadata?
        if let metadataDict = options["metadata"] as? [String: Any] {
          metadata = createParselyMetadata(from: metadataDict)
        }

        let extraData = options["extraData"] as? [String: Any]

        Parsely.sharedInstance.trackPlay(
          url: url,
          urlref: urlref ?? "",
          videoID: videoID,
          duration: duration,
          metadata: metadata,
          extraData: extraData
        )
      }
    }

    Function("trackPause") {
      Parsely.sharedInstance.trackPause()
    }

    Function("resetVideo") { (url: String, videoID: String) in
      Parsely.sharedInstance.resetVideo(url: url, videoID: videoID)
    }

    // Heartbeat management
    Function("startHeartbeat") { (config: [String: Any]?) in
      // For now, delegate to startEngagement with default URL
      // In a more advanced implementation, this could manage custom heartbeat timers
      Parsely.sharedInstance.startEngagement(url: "app://heartbeat")
    }

    Function("stopHeartbeat") {
      Parsely.sharedInstance.stopEngagement()
    }
  }

  private func createParselyMetadata(from dict: [String: Any]) -> ParselyMetadata {
    // Create metadata with basic properties that are accessible
    let title = dict["title"] as? String ?? ""
    let section = dict["section"] as? String ?? ""
    
    return ParselyMetadata(title: title, section: section)
  }

}
