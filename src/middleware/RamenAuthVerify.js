'use strict'

const Config = use('Adonis/Src/Config')
const axios = require('axios')

class RamenAuthVerify {
    async handle({ request, response }, next, properties) {
        let appUrl = Config._config.ramen.appUrl
        appUrl = appUrl + '/api/auth/verify'
        const claim = this.buildClaim(request, properties)
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

    buildClaim(request, pathParameters) {
        const url = request.url()
        const urlArr = url.split("/")
        const urlLength = pathParameters.length == 0 ? urlArr.length : urlArr.length-1
        let claim = ""

        for (let i = 1; i < urlLength; i++) {
            claim += "/" + urlArr[i];
        }

        for (let i = 0; i < pathParameters.length; i++) {
            claim += "/:" + pathParameters[i]
        }
        return claim
    }
}

module.exports = RamenAuthVerify