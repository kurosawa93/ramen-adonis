const { ServiceProvider } = require('@adonisjs/fold')

class RamenProvider extends ServiceProvider {
    boot() {}

    register() {
        this.app.singleton('RamenAuthController', (app) => {
            const RamenAuthController = require('../src/controllers/RamenAuthController')
            return RamenAuthController
        })
    }
}

module.exports = RamenProvider