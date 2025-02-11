import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as glob from 'glob'
import * as jsYamlLoader from '../src/config/js-yaml-loader'
import { Command } from 'commander'

export const info = (program: Command) => {
  program
    .command('info')
    .description('print meta information about build and runtime')
    .option('-c, --config [file]', 'configuration file containing lib directory')
    .option('-l, --lib-dir [directory]', 'directory of libraries')
    .action(printMeta)
}

function printMeta (this: any) {
  if (!this.libDir) {
    try {
      global.deepstreamCLI = this
      jsYamlLoader.loadConfigWithoutInitialisation()
      this.libDir = global.deepstreamLibDir
    } catch (e) {
      console.log(e)
      console.error('Please provide a libDir or a configFile to provide the relevant install information')
      process.exit(1)
    }
  }

  let meta
  let pkg
  try {
    meta = require('../meta.json')
  } catch (err) {
    // if deepstream is not installed as binary (source or npm)
    pkg = require('../package.json')
    meta = {
      deepstreamVersion: pkg.version,
      ref: pkg.gitHead || pkg._resolved || 'N/A',
      buildTime: 'N/A'
    }
  }
  meta.platform = os.platform()
  meta.arch = os.arch()
  meta.nodeVersion = process.version
  fetchLibs(this.libDir, meta)
  console.log(JSON.stringify(meta, null, 2))
}

function fetchLibs (libDir: string, meta: any) {
  const directory = libDir || 'lib'
  const files = glob.sync(path.join(directory, '*', 'package.json'))
  meta.libs = files.map((filePath) => {
    const pkg = fs.readFileSync(filePath, 'utf8')
    const object = JSON.parse(pkg)
    return `${object.name}:${object.version}`
  })
}
