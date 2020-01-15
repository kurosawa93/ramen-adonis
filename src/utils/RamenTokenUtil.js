'use strict'

const jwt = require('jsonwebtoken')

class RamenTokenUtil {
    static async generateAuthToken(auth, model) {
        return await auth.withRefreshToken().generate(model)
    }

    static async generateToken(key, model, expiry) {
        return jwt.sign(model, key, {expiresIn: expiry})
    }

    static decodeToken(token) {
        const appKey = process.env.APP_KEY
        try {
            const result = jwt.verify(token, appKey)
            return {data: result, error: {}}
        }
        catch(error) {
            return {error: {message: error.message}}
        }
    }

    static async resolveForgotToken(forgotToken) {
        const tokenResult = TokenUtil.decodeToken(forgotToken)
        if (tokenResult.error.message) {
            return {error: {code: 403, message: 'token is broken'}}
        }

        const accountId = tokenResult.data.sub
        const accountModel = await this.model.findOrFail(accountId)
        return {data: accountModel, error: {}}
    }

    static async saveToken(accountObj, token) {
        return await accountObj.tokens().create({
            token: token,
            type: 'forgot_password',
            is_revoked: false
        })
    }

    static async blacklistToken(accountObj) {
        return await accountObj.tokens().where('type', 'forgot_password').where('is_revoked', false).update({
            type: 'blacklisted',
            is_revoked: true
        })
    }
}

module.exports = RamenTokenUtil