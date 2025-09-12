import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const packageJsonPath = path.resolve(process.cwd(), 'package.json')
const examplePackageJsonPath = path.resolve(process.cwd(), 'example/package.json')

type ReleaseType = 'patch' | 'minor' | 'major'

const bumpVersion = async (releaseType: ReleaseType = 'patch') => {
  console.log(`🚀 Bumping ${releaseType} version...`)
  
  // Read main package.json
  const packageJsonContent = await readFile(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(packageJsonContent)

  const [major, minor, patch] = packageJson.version.split('.').map(Number)
  
  let newMajor = major
  let newMinor = minor  
  let newPatch = patch

  switch (releaseType) {
    case 'major':
      newMajor += 1
      newMinor = 0
      newPatch = 0
      break
    case 'minor':
      newMinor += 1
      newPatch = 0
      break
    case 'patch':
      newPatch += 1
      break
  }

  const newVersion = `${newMajor}.${newMinor}.${newPatch}`
  packageJson.version = newVersion

  // Write updated main package.json
  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

  // Update example package.json if it exists
  try {
    const exampleContent = await readFile(examplePackageJsonPath, 'utf-8')
    const exampleJson = JSON.parse(exampleContent)
    
    if (exampleJson.dependencies && exampleJson.dependencies['@appik-studio/expo-parsely']) {
      exampleJson.dependencies['@appik-studio/expo-parsely'] = `^${newVersion}`
      await writeFile(examplePackageJsonPath, JSON.stringify(exampleJson, null, 2) + '\n')
      console.log(`📝 Updated example package.json dependency to ^${newVersion}`)
    }
  } catch (error) {
    console.log('⚠️  Example package.json not found or could not be updated')
  }

  console.log(`✅ Version bumped from ${major}.${minor}.${patch} to ${newVersion}`)
  
  return newVersion
}

const releaseType = (process.argv[2] as ReleaseType) || 'patch'

bumpVersion(releaseType).catch(error => {
  console.error('❌ Error bumping version:', error)
  process.exit(1)
}) 
