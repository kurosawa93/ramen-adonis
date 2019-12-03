'use strict'

const Config = use('Adonis/Src/Config')
const axios = require('axios')

class RamenAuthVerify {
    async handle({ request, response }, next) {
        let appUrl = Config._config.ramen.appUrl
        appUrl = appUrl + '/api/auth/verify'
        let claim = request.url()
        let token = request.header('Authorization')
        if (!token) {
            return response.status(403).send({
                data: null,
                meta: {
                    message: 'You\'re not authorized.'
                }
            })
        }

        token = token.split(' ')
        token = token[1]
        const body = {
            claim: claim,
            token: token
        }

        try {
            const { data } = await axios.post(appUrl, body)
            request.body.created_by = data.data
        }
        catch(error) {
            return response.status(403).send({
                data: null,
                meta: {
                    message: 'You\'re not authorized'
                }
            })
        }
        await next()
    }
}

module.exports = RamenAuthVerify