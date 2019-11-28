'use strict'

const jwt = require('jsonwebtoken')

class RamenAuthUtil {
    static async basicAuthenticate(auth, model, email, password) {
        const credentials = await auth.withRefreshToken().attempt(email, password)
        let account = await model.query().where('email', email).first()
        account.token = credentials.token
        account.refresh_token = credentials.refreshToken
        return account
    }

    static async generateAuthToken(auth, model) {
        return await auth.withRefreshToken().generate(model)
    }

    static async generateToken(key, model) {
        return jwt.sign(model, key)
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

    static async validateClaim(id, claim, model) {
        const validAccount = await model.query().whereHas('roles.claims', (builder) => {
            builder.where('endpoint', claim)
        })
        .where('id', id)
        .first()
        return validAccount
    }

    static async sendMailForgotPassword(mail, url, token, accountObj) {
        const verifyUrl = url + '/api/auth/forgot/verify?token=' + token
        accountObj.verify_url = verifyUrl

        return await mail.send('emails.forgot', accountObj.toJSON(), (message) => {
            message
                .to(accountObj.email)
                .subject('Forgot Password')
        })
    }
}

module.exports = RamenAuthUtil