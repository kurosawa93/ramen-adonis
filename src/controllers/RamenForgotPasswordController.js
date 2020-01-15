'use strict'

const AuthUtil = require('../utils/RamenAuthUtil')
const TokenUtil = require('../utils/RamenTokenUtil')
const Config = use('Adonis/Src/Config')

class RamenForgotPasswordController {
    constructor(model, mail, token) {
        this.model = model
        this.mail = mail
        this.token = token
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
            const token = await TokenUtil.generateToken(key, {sub: accountModel.id}, 86400)
            await TokenUtil.saveToken(accountModel, token)
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

        const tokenResult = TokenUtil.decodeToken(token)
        if (tokenResult.error.message) {
            return response.status(403).send({
                data: null,
                meta: {
                    message: 'token is broken'
                }
            })
        }

        const blacklistedToken = await this.token.query().where('type', 'blacklisted').where('is_revoked', true).where('token', token).first()
        if (blacklistedToken) {
            return response.status(403).send({
                data: null,
                meta: {
                    message: 'token no longer valid'
                }
            })
        }

        const key = process.env.APP_KEY
        const newToken = await TokenUtil.generateToken(key, {sub: tokenResult.data.sub}, 180)
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

        const tokenResult = TokenUtil.decodeToken(token)
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
        await TokenUtil.blacklistToken(accountModel)

        return response.status(200).send({
            data: accountModel,
            meta: {
                message: 'password successfully changed'
            }
        })
    }

    async resolveForgotPasswordAes({request, response}) {
        const token = request.body.token
        if (!token) {
            return response.status(404).send({
                data: null,
                meta: {
                    message: 'token not provided'
                }
            })
        }

        const accountModel = await TokenUtil.resolveForgotToken(token)
        if (accountModel.error.code) {
            return response.status(accountModel.error.code).send({
                data: null,
                meta: {
                    message: accountModel.error.message
                }
            })
        }

        const decrypted = AuthUtil.decodePayload(Config._config.ramen.aesKey, request.body.payload)
        accountModel.password = decrypted.password
        await accountModel.save()
        await TokenUtil.blacklistToken(accountModel)

        return response.status(200).send({
            data: accountModel,
            meta: {
                message: 'password successfully changed'
            }
        })
    }
}

module.exports = RamenForgotPasswordController