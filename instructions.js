'use strict'

const path = require('path')

module.exports = async (cli) => {
    try {
        const configIn = path.join(__dirname, './config', 'index.js')
        const configOut = path.join(cli.helpers.configPath(), 'ramen.js')
        await cli.command.copy(configIn, configOut)
        cli.command.completed('create', 'config/ramen.js')

        const fileConfigIn = path.join(__dirname, './config', 'ramenfile.js')
        const fileConfigOut = path.join(cli.helpers.configPath(), 'ramenfile.js')
        await cli.command.copy(fileConfigIn, fileConfigOut)
        cli.command.completed('create', 'config/ramenfile.js')
    } catch (error) {
        // ignore error
        console.log(error)
    }
}