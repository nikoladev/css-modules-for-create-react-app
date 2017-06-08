const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const emoji = require('node-emoji')

const checkVersion = () => {
  const safeVersions = [
    '1.0.7'
  ]
  const filePath = path.join(process.cwd(), 'node_modules', 'react-scripts', 'package.json')
  getPackageVersion(filePath, (versionString) => {
    if (safeVersions.indexOf(versionString) < 0) {
      console.error(emoji.get('warning'), ` The current version of ${chalk.bold('react-scripts')} (${versionString}) is not supported by this version of ${chalk.bold('css-modules-for-create-react-app')}.`)
      return
    }

    replace()
  })
}

const getPackageVersion = (packageJsonPath, onSuccess) => {
  fs.stat(packageJsonPath, (statErr, stats) => {
    if (statErr) {
      throw statErr
    }

    fs.readFile(packageJsonPath, 'utf-8', (readErr, data) => {
      if (readErr) {
        throw readErr
      }

      const target = `"version"`
      const colonIndex = data.indexOf(target) + target.length
      const startIndex = data.indexOf(`"`, colonIndex) + 1
      const endIndex = data.indexOf(`"`, startIndex)
      const versionString = data.substring(startIndex, endIndex)

      if (onSuccess) {
        onSuccess(versionString)
      }
    })
  })
}

const replace = () => {
  const files = [
    path.join(process.cwd(), 'node_modules', 'react-scripts', 'config', 'webpack.config.dev.js'),
    path.join(process.cwd(), 'node_modules', 'react-scripts', 'config', 'webpack.config.prod.js')
  ]
  files.forEach((filePath) => {
    // check if react-script's webpack files exist
    fs.stat(filePath, (statErr, stats) => {
      if (statErr) {
        throw statErr
      }

      fs.readFile(filePath, 'utf-8', (readErr, data) => {
        if (readErr) {
          throw readErr
        }

        // make sure indentation is correct
        const endIndent = data.indexOf('importLoaders: 1,')
        const startIndent = data.lastIndexOf('\n', endIndent) + 1
        const indent = data.substring(startIndent, endIndent)

        const target = 'importLoaders: 1,'
        const result = `importLoaders: 1,
${indent}modules: true,
${indent}localIdentName: '[name]__[local]___[hash:base64:5]',`

        const replaced = data.replace(target, result)

        fs.writeFile(filePath, replaced, (writeErr) => {
          if (writeErr) {
            throw writeErr
          }

          const fileName = filePath.substring(filePath.lastIndexOf('node_modules'))

          console.log(emoji.get('white_check_mark'), chalk.green.bold(' Modified:'), fileName)
        })
      })
    })
  })
}

checkVersion()
