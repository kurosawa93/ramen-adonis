const { ServiceProvider } = require('@adonisjs/fold')
const axios = require('axios')

class RamenProvider extends ServiceProvider {
    boot() {
        const Request = use('Adonis/Src/Request')
        const Config = use('Adonis/Src/Config')
    
        Request.macro('validate', async function (response) {
            const authUrl = Config._config.ramen.authUrl
            let claim = this.url()
            let token = this.header('Authorization')
            token = token.split(' ')
            token = token[1]
            const body = {
                claim: claim,
                token: token
            }
    
            try {
                const { data } = await axios.post(authUrl, body)
                this.loginData = data.data
            }
            catch(error) {
                return response.status(403).send({
                    data: null,
                    meta: {
                        message: 'You\'re not authorized'
                    }
                })
            }
        })
    }

    register() {
        this.app.singleton('RamenQueryResolver', (app) => {
            const RamenQueryResolver = require('../src/RamenQueryResolver')
            return new RamenQueryResolver()
        })

        this.app.singleton('RamenAuthController', (app) => {
            const RamenAuthController = require('../src/controllers/RamenAuthController')
            return RamenAuthController
        })

        const Config = use('Adonis/Src/Config')
        const provider = Config._config.ramenfile.provider
        const options = Config._config.ramenfile.provider[provider]
        const providerClass = provider.charAt(0).toUpperCase() + provider.slice(1) + 'FileResolver'

        this.app.singleton('RamenFileController', (app) => {
            const RamenFileController = require('../src/controllers/RamenFileController')
            return RamenFileController
        })

        this.app.singleton('RamenFileProvider', (app) => {
            const RamenFileProvider = require('../src/' + providerClass)
            return new RamenFileProvider(options)
        })
    }
}

module.exports = RamenProvider