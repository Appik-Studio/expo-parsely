# 🚀 Release Guide for @appik-studio/expo-parsely

This guide outlines the release process for publishing the expo-parsely package to NPM.

## 📋 Prerequisites

### GitHub Package Registry Setup

1. Ensure the repository is public or you have appropriate permissions
2. No additional secrets needed - uses `GITHUB_TOKEN` automatically
3. Package will be published to `https://github.com/appik-studio/expo-parsely/packages`

### GitHub Secrets Required

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions (no setup needed)

## 🔄 Release Methods

### Method 1: GitHub Actions (Recommended)

#### Automated Release via GitHub UI

1. Go to the repository's Actions tab
2. Select "Release and Publish" workflow
3. Click "Run workflow"
4. Choose release type: `patch`, `minor`, or `major`
5. The workflow will:
   - Bump version
   - Run tests and linting
   - Build the package
   - Publish to GitHub Package Registry
   - Create GitHub release

### Method 2: Local Release

#### Quick Local Release

```bash
# For patch release (0.0.1 -> 0.0.2)
bun run release:patch

# For minor release (0.0.1 -> 0.1.0)
bun run release:minor

# For major release (0.0.1 -> 1.0.0)
bun run release:major
```

#### Manual Local Release

```bash
# 1. Bump version manually
bun run bump:patch  # or bump:minor or bump:major

# 2. Build the package
bun run build:all

# 3. Run tests
bun run test
bun run lint

# 4. Commit changes
git add .
git commit -m "chore: release v$(node -p require('./package.json').version)"

# 5. Create and push tag
git tag -a "v$(node -p require('./package.json').version)" -m "Release v$(node -p require('./package.json').version)"
git push origin main --tags

# 6. Publish to GitHub Package Registry
bun run publish:npm
```

## 🧪 Pre-Release Testing

### Dry Run Publication

```bash
# Test the publication process without actually publishing
bun run publish:dry
```

### Build Verification

```bash
# Clean and rebuild everything
bun run clean
bun install
bun run build:all
bun run lint
bun run test
```

### Example App Testing

```bash
# Test with the example app
cd example
bun install
bun run ios     # Test iOS build
bun run android # Test Android build
```

## 📊 Version Management

### Semantic Versioning

- **Patch** (`x.y.Z`) - Bug fixes, small improvements
- **Minor** (`x.Y.0`) - New features, backward compatible
- **Major** (`X.0.0`) - Breaking changes

### Current Version Strategy

- Start at `0.0.1` for initial release
- Use patch releases for bug fixes and improvements
- Use minor releases for new features
- Use major releases only for breaking changes

## 📦 Package Structure

### Files Included in NPM Package

- `build/` - Compiled TypeScript output
- `android/` - Android native module
- `ios/` - iOS native module
- `expo-module.config.json` - Module configuration
- `API_REFERENCE.md` - Complete API documentation

### Publishing Configuration

```json
{
  "publishConfig": {
    "registry": "https://registry.npmjs.org",
    "access": "public"
  }
}
```

## 🔍 Post-Release Checklist

### Immediate Verification

- [ ] Package appears on GitHub Packages: https://github.com/appik-studio/expo-parsely/packages
- [ ] GitHub release is created with proper tag
- [ ] README installation instructions work
- [ ] API documentation is accessible

### Integration Testing

- [ ] Install in a fresh Expo project
- [ ] Test basic initialization
- [ ] Verify iOS compilation
- [ ] Verify Android compilation
- [ ] Test core tracking functionality

### Documentation Updates

- [ ] Update installation examples in README
- [ ] Verify API_REFERENCE.md is current
- [ ] Update CHANGELOG if exists
- [ ] Announce release in relevant channels

## 🚨 Troubleshooting

### GitHub Package Registry Publish Fails

```bash
# Check authentication
npm whoami --registry=https://npm.pkg.github.com

# Check package details
npm publish --dry-run --registry=https://npm.pkg.github.com

# Verify GitHub token permissions (needs 'write:packages' and 'read:packages')
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

### Build Failures

```bash
# Clean everything
bun run clean
rm -rf node_modules
rm -rf build

# Reinstall and rebuild
bun install
bun run build:all
```

### Version Conflicts

```bash
# Check current version
node -p "require('./package.json').version"

# Manually set version if needed
node -e "const pkg = require('./package.json'); pkg.version = '0.0.1'; require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');"
```

## 📈 Release History

| Version | Date | Changes                                       |
| ------- | ---- | --------------------------------------------- |
| 0.0.1   | TBD  | Initial release with Parse.ly SDK integration |

## 🔗 Resources

- [GitHub Package Registry](https://github.com/appik-studio/expo-parsely/packages)
- [GitHub Repository](https://github.com/appik-studio/expo-parsely)
- [API Documentation](./API_REFERENCE.md)
- [Main Documentation](./README.md)
