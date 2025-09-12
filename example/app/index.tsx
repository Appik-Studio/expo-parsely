import ExpoParsely, { TrackableTouchable, useElementTracking } from "expo-parsely";
import { useEffect } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import styles from "./styles";

const HomePage = () => {
  // Track page view on mount
  useEffect(() => {
    ExpoParsely.trackPageView("https://example.com/home");
  }, []);

  // Element tracking for the main content area
  const { trackClick } = useElementTracking({
    elementId: "main-content",
    elementType: "view",
    trackImpressions: true,
    trackViews: true,
    location: "home-page",
  });

  const handleArticleClick = (articleId: string) => {
    Alert.alert("Article Clicked", `Article ${articleId} clicked!`);
    // Track the click
    ExpoParsely.trackElement("click", "article", articleId, "home-page");
  };

  const handleButtonClick = (buttonName: string) => {
    Alert.alert("Button Clicked", `${buttonName} button clicked!`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Parse.ly SDK</Text>
        <Text style={styles.subtitle}>Demo Application</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Page View Tracking</Text>
          <Text style={styles.description}>
            This page view has been automatically tracked with metadata
            including title, authors, and tags.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trackable Elements</Text>
          <Text style={styles.description}>
            These buttons and articles are trackable components that send events
            to Parse.ly.
          </Text>

          <View style={styles.articleGrid}>
            {["article-1", "article-2", "article-3", "article-4"].map(
              (articleId, index) => (
                <TrackableTouchable
                  key={articleId}
                  trackingId={articleId}
                  componentName="ArticleCard"
                  elementType="article"
                  trackImpressions={true}
                  trackViews={true}
                  viewThreshold={1000}
                  style={[styles.button, styles.articleButton]}
                  onPress={() => handleArticleClick(articleId)}
                >
                  <Text style={[styles.buttonText, styles.articleButtonText]}>
                    Article {index + 1}
                  </Text>
                  <Text style={styles.articleId}>ID: {articleId}</Text>
                </TrackableTouchable>
              )
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manual Tracking</Text>
          <Text style={styles.description}>
            These buttons demonstrate manual event tracking.
          </Text>

          <View style={styles.buttonContainer}>
            <TrackableTouchable
              trackingId="cta-button-1"
              componentName="CTAButton"
              elementType="button"
              trackImpressions={true}
              trackViews={false}
              style={[styles.button, styles.secondaryButton]}
              onPress={() => handleButtonClick("CTA 1")}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Call to Action 1
              </Text>
            </TrackableTouchable>

            <TrackableTouchable
              trackingId="cta-button-2"
              componentName="CTAButton"
              elementType="button"
              trackImpressions={true}
              trackViews={false}
              style={[styles.button, styles.secondaryButton]}
              onPress={() => handleButtonClick("CTA 2")}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Call to Action 2
              </Text>
            </TrackableTouchable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This demo showcases Parse.ly tracking integration with automatic
            page views, element impressions/views/clicks, and manual event
            tracking. Check the console for tracking events.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomePage;
