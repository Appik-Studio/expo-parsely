/**
 * Expo Parsely Plugin
 *
 * This plugin configures your Expo project for Parsely analytics SDK integration
 * and can automatically wrap your app with the TrackingProvider.
 */

import { ConfigPlugin } from '@expo/config-plugins'

import type { ExpoParselyPluginProps } from './types'

const withExpoParsely: ConfigPlugin<ExpoParselyPluginProps> = (config, props) => {
  // For now, no specific configuration needed beyond dependencies
  // which are handled in the podspec and build.gradle

  // If autoWrap is enabled, we'll enhance this in the future
  // to automatically wrap the app root with TrackingProvider

  return config
}

export default withExpoParsely
