'use strict'

const Env = use('Env')

module.exports = {
    appUrl: Env.get('RAMEN_APP_URL'),
    aesKey: Env.get('RAMEN_AES_KEY'),
    validationEnabled: Env.get('RAMEN_VALIDATION_ENABLED')
}