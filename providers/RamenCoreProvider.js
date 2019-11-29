const { ServiceProvider } = require('@adonisjs/fold')
const axios = require('axios')

class RamenProvider extends ServiceProvider {
    boot() {
        const Request = use('Adonis/Src/Request')
        const Config = use('Adonis/Src/Config')
    
        Request.macro('validate', async function (response) {
            let appUrl = Config._config.ramen.appUrl
            appUrl = appUrl + '/api/auth/verify'
            let claim = this.url()
            let token = this.header('Authorization')
            if (!token) {
                response.status(403).send({
                    data: null,
                    meta: {
                        message: 'You\'re not authorized. token not provided'
                    }
                })
                return {}
            }

            token = token.split(' ')
            token = token[1]
            const body = {
                claim: claim,
                token: token
            }
    
            try {
                const { data } = await axios.post(appUrl, body)
                this.loginData = data.data
            }
            catch(error) {
                response.status(403).send({
                    data: null,
                    meta: {
                        message: 'You\'re not authorized'
                    }
                })
                return {}
            }
        })
    }

    register() {
        this.app.singleton('Ramen/QueryResolver', (app) => {
            const RamenQueryResolver = require('../src/RamenQueryResolver')
            return new RamenQueryResolver()
        })

        this.app.singleton('Ramen/ModelTrait', (app) => {
            const RamenModelTrait = require('../src/traits/RamenModel')
            return new RamenModelTrait()
        })
    }
}

module.exports = RamenProvider