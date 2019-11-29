const { ServiceProvider } = require('@adonisjs/fold')

class RamenProvider extends ServiceProvider {
    boot() {}

    register() {
        this.app.singleton('Ramen/AuthController', (app) => {
            const RamenAuthController = require('../src/controllers/RamenAuthController')
            return RamenAuthController
        })

        this.app.singleton('Ramen/ForgotPasswordController', (app) => {
            const RamenForgotPasswordController = require('../src/controllers/RamenForgotPasswordController')
            return RamenForgotPasswordController
        })
    }
}

module.exports = RamenProvider