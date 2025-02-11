import { installer } from '../src/utils/installer'
import * as jsYamlLoader from '../src/config/js-yaml-loader'
import { Command } from 'commander'

export const install = (program: Command) => {
  program
    .command('install')
    .description('install connectors')
    .usage('<type> <name>[:version]')
    .option('-c, --config [file]', 'configuration file containing the lib directory')
    .option('-l, --lib-dir [directory]', 'directory where to extract the connector')
    .option('--verbose', 'more debug output')
    .option('--quiet', 'no output')
    .on('--help', () => {
      console.log('  Examples:')
      console.log('')
      console.log('    $ deepstream install cache redis')
      console.log('    $ deepstream install storage rethinkdb:0.1.0')
      console.log('')
      console.log('    list of available connectors: https://deepstream.io/download')
      console.log('')
    })
    .action(action)
}

function action (this: any, type: string, nameAndVersion: string) {
  const installArgs = Array.prototype.slice.call(arguments, 0, arguments.length - 1)
  if (installArgs.length < 2) {
    this.help()
  }

  if (!this.libDir) {
    try {
      global.deepstreamCLI = this
      jsYamlLoader.loadConfigWithoutInitialisation()
      this.libDir = global.deepstreamLibDir
    } catch (e) {
      console.error('Please provide a libDir or a configFile to provide the relevant install information')
      process.exit(1)
    }
  }

  /*
	 * Syntax:
	 * TYPE NAME:VERSION
	 * version is optional
	 */
  type = installArgs[0]
  nameAndVersion = installArgs[1].split(':')
  const name = nameAndVersion[0]
  const version = nameAndVersion[1]

  if (this.quiet) {
    process.env.QUIET = '1'
  } else if (this.verbose) {
    process.env.VERBOSE = '1'
  }

  installer({
    type,
    name,
    version,
    dir: this.libDir
  }, (err: string | Error | null) => {
    if (err) {
      // @ts-ignore
      console.error(err.toString().red)
      process.exit(1)
    }
  })
}
