import * as jsYamlLoader from '../src/config/js-yaml-loader'
import { Command } from 'commander'
import { FileBasedAuthentication } from '../src/services/authentication/file/file-based-authentication'

export const hash = (program: Command) => {
  program
    .command('hash [password]')
    .description('Generate a hash from a plaintext password using file auth configuration settings')
    .option('-c, --config [file]', 'configuration file containing file auth and hash settings')
    .action(action)
}

function action (this: any, password: string) {
  global.deepstreamCLI = this
  const config = jsYamlLoader.loadConfigWithoutInitialisation().config

  if (config.auth.type !== 'file') {
    console.error('Error: Can only use hash with file authentication as auth type')
    process.exit(1)
  }

  if (!config.auth.options.hash) {
    console.error('Error: Can only use hash with file authentication')
    process.exit(1)
  }

  config.auth.options.path = ''

  if (!password) {
    console.error('Error: Must provide password to hash')
    process.exit(1)
  }

  // Mock file loading since a users.yml file is not required
  // jsYamlLoader.readAndParseFile = function () {}

  const fileAuthenticationHandler = new FileBasedAuthentication(config.auth.options, {} as any)
  fileAuthenticationHandler.createHash(password, (err: Error, passwordHash: string) => {
    if (err) {
      console.error('Hash could not be created', err)
      process.exit(1)
    }
    console.log('Password hash:', passwordHash)
  })
}
