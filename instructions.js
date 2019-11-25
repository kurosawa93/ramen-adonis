'use strict'

const path = require('path')

module.exports = async (cli) => {
    try {
        const configInFile = path.join(__dirname, './config', 'index.js')
        const configOutFile = path.join(cli.helpers.configPath(), 'ramen.js')
        await cli.command.copy(configInFile, configOutFile)
        cli.command.completed('create', 'config/ramen.js')
    } catch (error) {
        // ignore error
        console.log(error)
    }
}