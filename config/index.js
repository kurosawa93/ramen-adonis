'use strict'

const Env = use('Env')

module.exports = {
    authUrl: Env.get('RAMEN_AUTH_URL'),
    aesKey: Env.get('RAMEN_AES_KEY'),
    validationEnabled: Env.get('RAMEN_VALIDATION_ENABLED')
}