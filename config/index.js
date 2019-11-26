'use strict'

const Env = use('Env')

module.exports = {
    authUrl: Env.get('RAMEN_AUTH_URL'),
    traitPath: Env.get('RAMEN_TRAIT_PATH'),
    aesKey: Env.get('RAMEN_AES_KEY')
}