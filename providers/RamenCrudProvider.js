const { ServiceProvider } = require('@adonisjs/fold')
const axios = require('axios')

class RamenProvider extends ServiceProvider {
    boot() {}

    register() {
        this.app.singleton('RamenCrudController', (app) => {
            const RamenCrudController = require('../src/controllers/RamenCrudController')
            return RamenCrudController
        })
    }
}

module.exports = RamenProvider