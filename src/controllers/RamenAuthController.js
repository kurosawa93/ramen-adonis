'use strict'

const AuthUtil = require('../utils/RamenAuthUtil')
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
        let encrypted = request.body.payload
        encrypted = Buffer.from(encrypted, 'base64')
        encrypted = encrypted.toString('utf8')
        encrypted = JSON.parse(encrypted)

        let iv = encrypted.iv
        iv = Buffer.from(iv, 'base64')

        const key = Buffer.from(Config._config.ramen.aesKey, 'base64')
        const decryptor = crypto.createDecipheriv("aes-256-cbc", key, iv)
        let decrypted = decryptor.update(encrypted.value, 'base64', 'utf8')
        decrypted += decryptor.final('utf8')
        decrypted = JSON.parse(decrypted)
        
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

        const credentials = await AuthUtil.generateAuthToken(auth, account.data)
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

    async initForgetPassword({request, auth, response}) {
        const email = request.body.email
        const accountModel = await this.model.findBy('email', email)
        if (!accountModel) {
            return response.status(404).send({
                data: null,
                meta: {
                    message: 'email not found'
                }
            })
        }

        try {
            const key = process.env.APP_KEY
            const url = Config._config.ramen.appUrl
            const token = await AuthUtil.generateToken(key, {sub: accountModel.id})
            await AuthUtil.sendMailForgotPassword(this.mail, url, token, accountModel)
        }
        catch(error) {
            return response.status(500).send({
                data: null,
                meta: {
                    message: 'Server error. ' + error.message
                }
            })
        }

        return response.status(200).send({
            data: accountModel,
            meta: {
                message: 'mail successfully sent'
            }
        })
    }

    async verifyForgotPassword({request, response}) {
        const token = request.input('token')
        if (!token) {
            return response.status(404).send({
                data: null,
                meta: {
                    message: 'token not provided'
                }
            })
        }

        const tokenResult = AuthUtil.decodeToken(token)
        if (tokenResult.error.message) {
            return response.status(403).send({
                data: null,
                meta: {
                    message: 'token is broken'
                }
            })
        }

        const key = process.env.APP_KEY
        const newToken = await AuthUtil.generateToken(key, {sub: tokenResult.data.sub})
        const url = Config._config.ramen.redirectUrl + '?token=' + newToken
        return response.redirect(url)
    }

    async resolveForgotPassword({request, response}) {
        const token = request.body.token
        if (!token) {
            return response.status(404).send({
                data: null,
                meta: {
                    message: 'token not provided'
                }
            })
        }

        const tokenResult = AuthUtil.decodeToken(token)
        if (tokenResult.error.message) {
            return response.status(403).send({
                data: null,
                meta: {
                    message: 'token is broken'
                }
            })
        }

        const accountId = tokenResult.data.sub
        let accountModel = await this.model.findOrFail(accountId)
        accountModel.password = request.body.password
        await accountModel.save()

        return response.status(200).send({
            data: accountModel,
            meta: {
                message: 'password successfully changed'
            }
        })
    }
}

module.exports = AuthController
