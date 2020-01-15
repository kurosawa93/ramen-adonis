'use strict'

const crypto = require('crypto')

class RamenAuthUtil {
    static async basicAuthenticate(auth, model, email, password) {
        const credentials = await auth.withRefreshToken().attempt(email, password)
        let account = await model.query().where('email', email).first()
        account.token = credentials.token
        account.refresh_token = credentials.refreshToken
        return account
    }

    static async validateClaim(id, permission, model) {
        const validAccount = await model.query().whereHas('roles.claims', (builder) => {
            builder.where('permission', permission)
        })
        .where('id', id)
        .with('profile')
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

    static decodePayload(aesKey, payload) {
        let encrypted = Buffer.from(payload, 'base64')
        encrypted = encrypted.toString('utf8')
        encrypted = JSON.parse(encrypted)

        let iv = encrypted.iv
        iv = Buffer.from(iv, 'base64')

        const key = Buffer.from(aesKey, 'base64')
        const decryptor = crypto.createDecipheriv("aes-256-cbc", key, iv)
        let decrypted = decryptor.update(encrypted.value, 'base64', 'utf8')
        decrypted += decryptor.final('utf8')
        decrypted = JSON.parse(decrypted)
        return decrypted
    }
}

module.exports = RamenAuthUtil