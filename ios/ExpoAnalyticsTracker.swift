import Foundation
import ParselyAnalytics

public class ExpoAnalyticsTracker {
  
  public init() {
    print("ExpoAnalyticsTracker initialized with ParselyAnalytics")
  }
  
  public func configure(siteId: String) {
    Parsely.sharedInstance.configure(siteId: siteId)
  }
  
  public func trackEvent(event: String, parameters: [String: Any]?) {
    print("ExpoAnalyticsTracker trackEvent: \(event)")
    
    if let url = parameters?["url"] as? String {
      self.trackPageView(url: url)
    }
  }
  
  public func trackPageView(url: String) {
    Parsely.sharedInstance.trackPageView(url: url)
  }
  
  public func startEngagement(url: String) {
    Parsely.sharedInstance.startEngagement(url: url)
  }
  
  public func stopEngagement() {
    Parsely.sharedInstance.stopEngagement()
  }
}
