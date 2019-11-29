'use strict'

const Env = use('Env')

module.exports = {
    appUrl: Env.get('RAMEN_APP_URL'),
    redirectUrl: Env.get('RAMEN_REDIRECT_URL'),
    aesKey: Env.get('RAMEN_AES_KEY')
}