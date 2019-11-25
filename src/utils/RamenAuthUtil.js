'use strict'

const jwt = require('jsonwebtoken')

class RamenAuthUtil {
    async authenticate(auth, model, email, password) {
        const credentials = await auth.withRefreshToken().attempt(email, password)
        let account = await model.query().where('email', email).first()
        account.token = credentials.token
        account.refresh_token = credentials.refreshToken
        return account
    }

    async generateToken(auth, model) {
        return await auth.withRefreshToken().generate(model)
    }

    decodeToken(token) {
        const appKey = process.env.APP_KEY
        try {
            const result = jwt.verify(token, appKey)
            return {data: result, error: {}}
        }
        catch(error) {
            return {error: {message: error.message}}
        }
    }
}

module.exports = RamenAuthUtil