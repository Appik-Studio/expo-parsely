/**
 * Expo Parsely Plugin
 *
 * This plugin configures your Expo project for Parsely analytics SDK integration.
 */

import { ConfigPlugin } from "@expo/config-plugins";
import type { ExpoParselyPluginProps } from "./types";

const withExpoParsely: ConfigPlugin<ExpoParselyPluginProps> = (
  config,
  props
) => {
  // For now, no specific configuration needed beyond dependencies
  // which are handled in the podspec and build.gradle
  return config;
};

export default withExpoParsely;
