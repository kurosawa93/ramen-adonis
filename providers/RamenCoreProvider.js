const { ServiceProvider } = require('@adonisjs/fold')

class RamenProvider extends ServiceProvider {
    boot() {}

    register() {
        this.app.singleton('Ramen/QueryResolver', (app) => {
            const RamenQueryResolver = require('../src/RamenQueryResolver')
            return new RamenQueryResolver()
        })

        this.app.singleton('Ramen/AuthVerify', (app) => {
            const RamenAuthVerify = require('../src/middleware/RamenAuthVerify')
            return new RamenAuthVerify()
        })

        this.app.singleton('Ramen/ModelTrait', (app) => {
            const RamenModelTrait = require('../src/traits/RamenModel')
            return new RamenModelTrait()
        })
    }
}

module.exports = RamenProvider