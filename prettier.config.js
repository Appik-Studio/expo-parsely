module.exports = {
  semi: false,
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'none',
  arrowParens: 'avoid',
  jsxSingleQuote: true,
  bracketSameLine: true,
  bracketSpacing: true,
  useTabs: false,
  tabWidth: 2,
  endOfLine: 'auto',
  overrides: [
    {
      files: '*.tsx',
      options: {
        printWidth: 120,
        tabWidth: 2
      }
    },
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      options: {
        bracketSpacing: true,
        bracketSameLine: true
      }
    }
  ]
}
