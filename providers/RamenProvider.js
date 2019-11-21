const { ServiceProvider } = require.main.require('@adonisjs/fold')
const axios = require('axios')

class RamenProvider extends ServiceProvider {
  boot() {
    const Request = use('Adonis/Src/Request')
    const Config = use('Adonis/Src/Config')

    Request.macro('validate', function () {
        const authUrl = Config.ramen.authUrl
        let claim = this.url()
        let token = this.header('Authorization')
        token = token.split(' ')
        token = token[1]
        const body = {
            claim: claim,
            token: token
        }
        console.log(authUrl, body)

        // try {
        //     const { data } = await axios.post(authUrl, body)
        //     return data.data
        // }
        // catch(error) {
        //     return
        // }
    })
  }

  register() {
      this.app.singleton('Adonis/Addons/Ramen', (app) => {
          const RamenQueryResolver = require('../src/RamenQueryResolver')
          return new RamenQueryResolver()
      })

      this.app.alias('Adonis/Addons/Ramen', 'Ramen')
  }
}

module.exports = RamenProvider