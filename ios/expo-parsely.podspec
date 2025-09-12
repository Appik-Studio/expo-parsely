Pod::Spec.new do |s|
  s.name           = 'expo-parsely'
  s.version        = '0.0.5'
  s.summary        = 'Expo Parsely analytics module'
  s.description    = 'Expo module for Parsely analytics SDK integration'
  s.homepage       = 'https://github.com/livio/expo-parsely'
  s.license        = { :type => 'MIT' }
  s.author         = { 'Livio Gamassia' => 'livio@appik-studio.ch' }
  s.source         = { :git => 'https://github.com/livio/expo-parsely.git', :tag => s.version.to_s }
  s.platform       = :ios, '13.0'
  s.source_files   = '*.{h,m,swift}'
  s.swift_version  = '5.0'
  s.module_name    = 'expo_parsely'
  s.dependency 'ExpoModulesCore'
  s.dependency 'ParselyAnalytics'
end
