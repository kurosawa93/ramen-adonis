'use strict'

const AuthUtil = require('../utils/RamenAuthUtil')

class AuthController {
    constructor(model) {
        this.model = model
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

        const credentials = await AuthUtil.generateToken(auth, account.data)
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
        const decodedToken = AuthUtil.decodeToken(token)
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
