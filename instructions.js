'use strict'

const path = require('path')

module.exports = async (cli) => {
    try {
        const configInFile = path.join(__dirname, './config', 'index.js')
        const configOutFile = path.join(cli.helpers.configPath(), 'ramen.js')
        await cli.command.copy(configInFile, configOutFile)
        cli.command.completed('create', 'config/ramen.js')
        const traitsInFile = path.join(__dirname, './src/traits', 'RamenModel.js')
        const traitsOutFile = path.join(cli.helpers.appRoot(), './app/Models/Traits', 'RamenModel.js')
        await cli.command.copy(traitsInFile, traitsOutFile)
        cli.command.completed('create', 'app/Models/Traits/RamenModel.js')
    } catch (error) {
        // ignore error
        console.log(error)
    }
}