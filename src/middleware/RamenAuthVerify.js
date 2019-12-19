'use strict'

const Config = use('Adonis/Src/Config')
const axios = require('axios')

class RamenAuthVerify {
    /**
     * 
     * @param {*} param0 
     * @param {*} next 
     * @param {*} properties 
     * 
     * properties is array, and should only contain one element, which is the API Permission.
     * One API should only have one permission. This is debatable in the future.
     */
    async handle({ request, response }, next, properties) {
        let appUrl = Config._config.ramen.appUrl
        appUrl = appUrl + '/api/auth/verify'
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
            claim: properties[0],
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