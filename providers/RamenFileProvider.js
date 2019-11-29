const { ServiceProvider } = require('@adonisjs/fold')
const axios = require('axios')

class RamenProvider extends ServiceProvider {
    boot() {}

    register() {
        const Config = use('Adonis/Src/Config')
        const provider = Config._config.ramenfile.provider
        const options = Config._config.ramenfile[provider]
        const providerClass = provider.charAt(0).toUpperCase() + provider.slice(1) + 'FileResolver'

        this.app.singleton('Ramen/FileController', (app) => {
            const RamenFileController = require('../src/controllers/RamenFileController')
            return RamenFileController
        })

        this.app.singleton('Ramen/FileProvider', (app) => {
            const RamenFileProvider = require('../src/' + providerClass)
            return new RamenFileProvider(options)
        })
    }
}

module.exports = RamenProvider