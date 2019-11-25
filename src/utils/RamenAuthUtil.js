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

    static async generateToken(auth, model) {
        return await auth.withRefreshToken().generate(model)
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
}

module.exports = RamenAuthUtil