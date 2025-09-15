import 'ts-node/register'
import 'tsx/cjs'

module.exports = {
  expo: {
    name: 'expo-parsely-example',
    slug: 'expo-parsely-example',
    scheme: 'expo-parsely-example',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    plugins: [
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '16.0'
          }
        }
      ]
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.expoparsely.example'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.expoparsely.example'
    }
  }
}
