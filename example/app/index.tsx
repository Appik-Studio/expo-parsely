import ExpoParsely from 'expo-parsely'
import { useEffect } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import styles from './styles'

const HomePage = () => {
  // Track page view on mount
  useEffect(() => {
    ExpoParsely.trackPageView('https://example.com/home')
  }, [])

  // Note: Impression and view tracking should be handled through custom trackPageView
  // calls with actions like '_impression' and '_view'

  const handleArticleClick = (articleId: string) => {
    Alert.alert('Article Clicked', `Article ${articleId} clicked!`)
    // Track the click
    ExpoParsely.trackPageView('https://example.com/home', {
      action: '_click',
      data: {
        elementId: articleId,
        elementType: 'article',
        elementLocation: 'home-page'
      }
    })
    ExpoParsely.recordActivity()
  }

  const handleButtonClick = (buttonName: string, buttonId: string) => {
    Alert.alert('Button Clicked', `${buttonName} button clicked!`)
    // Track the click
    ExpoParsely.trackPageView('https://example.com/home', {
      action: '_click',
      data: {
        elementId: buttonId,
        elementType: 'button',
        elementLocation: 'home-page'
      }
    })
    ExpoParsely.recordActivity()
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Parse.ly SDK</Text>
        <Text style={styles.subtitle}>Demo Application with Debug Logging</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parse.ly Heartbeat Tracking</Text>
          <Text style={styles.description}>
            Parse.ly engaged-time tracking is active with 150-second heartbeat intervals and 5-second activity timeout.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Debug Logging</Text>
          <Text style={styles.description}>
            Debug logging is enabled in this demo. Check the console for Parse.ly heartbeat events, activity tracking,
            and engagement metrics. All debug messages are prefixed with "💓 [Parse.ly Debug]".
          </Text>
          <Text style={styles.description}>
            Features demonstrated: • Heartbeat events every 150 seconds • Activity detection with 5-second timeout •
            Touch and scroll event logging • Page view tracking
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Page View Tracking</Text>
          <Text style={styles.description}>
            This page view has been automatically tracked with metadata including title, authors, and tags.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trackable Elements</Text>
          <Text style={styles.description}>
            These buttons and articles are trackable components that send events to Parse.ly.
          </Text>

          <View style={styles.articleGrid}>
            {['article-1', 'article-2', 'article-3', 'article-4'].map((articleId, index) => (
              <TouchableOpacity
                key={articleId}
                style={[styles.button, styles.articleButton]}
                onPress={() => handleArticleClick(articleId)}>
                <Text style={[styles.buttonText, styles.articleButtonText]}>Article {index + 1}</Text>
                <Text style={styles.articleId}>ID: {articleId}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manual Tracking</Text>
          <Text style={styles.description}>These buttons demonstrate manual event tracking.</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => handleButtonClick('CTA 1', 'cta-button-1')}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Call to Action 1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => handleButtonClick('CTA 2', 'cta-button-2')}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Call to Action 2</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This demo showcases Parse.ly engaged-time tracking with configurable debug logging, 150-second heartbeat
            intervals, and 5-second activity timeout. Check console for detailed Parse.ly debug messages and engagement
            tracking. Fully compliant with Parse.ly's official specifications.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default HomePage
