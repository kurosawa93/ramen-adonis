'use strict'

const AuthUtil = require('../utils/RamenAuthUtil')
const TokenUtil = require('../utils/RamenTokenUtil')
const crypto = require('crypto')
const Config = use('Adonis/Src/Config')

class AuthController {
    constructor(model, mail) {
        this.model = model
        this.mail = mail
    }

    async login({request, auth, response}) {
        const email = request.body.email
        const password = request.body.password
        const account = await AuthUtil.basicAuthenticate(auth, this.model, email, password)
        return response.status(200).send({
            data: account,
            meta: {
                message: 'login is successfull'
            }
        })
    }

    async aesLogin({request, auth, response}) {
        const decrypted = AuthUtil.decodePayload(Config._config.ramen.aesKey, request.body.payload)
        const account = await AuthUtil.basicAuthenticate(auth, this.model, decrypted.email, decrypted.password)
        return response.status(200).send({
            data: account,
            meta: {
                message: 'login is successfull'
            }
        })
    }

    async register({request, auth, response}) {
        let account = await this.model.createObject(request.body)
        if (account.error.message != null) {
            return response.status(500).send({
                data: null,
                meta: {
                    message: account.error.message
                }
            })
        }

        const credentials = await TokenUtil.generateAuthToken(auth, account.data)
        account.data.token = credentials.token
        account.data.refresh_token = credentials.refreshToken
        return response.status(200).send({
            data: account.data,
            meta: {
                message: 'register is successfull'
            }
        })
    }

    async aesRegister({request, auth, response}) {
        const decrypted = AuthUtil.decodePayload(Config._config.ramen.aesKey, request.body.payload)
        let account = await this.model.createObject(decrypted)
        if (account.error.message != null) {
            return response.status(500).send({
                data: null,
                meta: {
                    message: account.error.message
                }
            })
        }

        const credentials = await TokenUtil.generateAuthToken(auth, account.data)
        account.data.token = credentials.token
        account.data.refresh_token = credentials.refreshToken
        return response.status(200).send({
            data: account.data,
            meta: {
                message: 'register is successfull'
            }
        })
    }

    async refreshToken({request, response, auth}) {
        const refreshToken = request.body.refresh_token
        const credentials = await auth.newRefreshToken().generateForRefreshToken(refreshToken)
        return response.status(200).send({
            data: {
                token: credentials.token,
                refresh_token: credentials.refreshToken
            },
            meta: {
                message: 'token refreshed'
            }
        })
    }

    async verify({request, auth, response}) {
        const token = request.body.token
        const claim = request.body.claim
        const decodedToken = TokenUtil.decodeToken(token)
        if (decodedToken.error.message != null) {
            return response.status(403).send({
                data: null,
                meta: {
                    message: decodedToken.error.message
                }
            })
        }
        const account = await AuthUtil.validateClaim(decodedToken.data.uid, claim, this.model)
        if (account == null) {
            return response.status(403).send({
                data: null,
                meta: {
                    message: 'You\'re not authorized'
                }
            })
        }
        return response.status(200).send({
            data: account,
            meta: {
                message: 'Authorized'
            }
        })
    }
}

module.exports = AuthController
