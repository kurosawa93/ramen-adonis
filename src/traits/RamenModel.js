'use strict'

const QueryResolver = use('Ramen/QueryResolver')
const Database = use('Database')

class RamenModel {
  register (Model, customOptions = {}) {
    const defaultOptions = {
      relations: [],
      columns: []
    }
    const options = Object.assign(defaultOptions, customOptions)
    
    Model.createObject = async function (data, trx = null) {
      let genericModel = new Model()
      return await Model.saveObject(data, genericModel)
    }

    Model.updateObject = async function (id, data) {
      let genericModel = await Model.findOrFail(id)
      return await Model.saveObject(data, genericModel)
    }

    Model.saveObject = async function (data, genericModel) {
      const columns = options.columns
      if (columns.length == 0) {
        return {error: {message: 'Model Error. Please define columns in your model'}}
      }

      columns.forEach(key => {
        if (data[key] != null) genericModel[key] = data[key]
      })
  
      try {
          await genericModel.save()
          await Model.saveRelations(data, genericModel)
          return {data: genericModel, error: {}}
      } catch (error){
        if (genericModel.id) {
          await genericModel.delete()
        }
        return {error: {message: 'POSTGRESQL ERROR. ' + error.message}}
      }
    }

    Model.saveRelations = async function (data, genericModel) {
      const relations = options.relations
      if (relations.length == 0) {
        return
      }

      for (let i = 0; i < relations.length; i++) {
        const relation = relations[i]
        const relationData = data[relation.name]
        if (!relationData) {
          continue
        }
        
        switch(relation.type) {
          case 'belongsToMany':
            await QueryResolver.saveBelongsToManyRelations(genericModel, relation.name, relationData)
            break
          case 'hasMany':
            await QueryResolver.saveHasManyRelations(genericModel, relation.name, relationData)
            break
          default:
            await QueryResolver.saveHasOneRelations(genericModel, relation.name, relationData)
        }
      }
    }

    Model.upsert = async function (data) {
      try {
        if (data.id != null) {
          let genericModel = await Model.updateObject(data.id, data)

          if (genericModel.error.message != null){
            return {error: {message: genericModel.error.message}}
          }
          return {data: genericModel.data, error: {}}
        } else {
          let genericModel = await Model.createObject(data)

          if (genericModel.error.message != null){
            return {error: {message: genericModel.error.message}}
          }
          return {data: genericModel.data, error: {}}
        }
      } catch(error){
        return {error: {message: 'POSTGRESQL ERROR. ' + error.message}}
      }
    }

    Model.deleteData = async function (id) {
      try {
        const modelObj = await Model.findOrFail(id)
        await modelObj.delete()
        return {data: modelObj, error: {}}
      }
      catch(error) {
        return {error: {message: 'POSTGRESQL ERROR. ' + error.message}}
      }
    }

    Model.commonQueryBuilder = async function (builder, queryParams){
      let defaultMeta = {
        message: 'data successfully retrieved'
      }

      try {
        var queryResult = await QueryResolver.commonQueryBuilder(builder, queryParams)
        if (queryResult.pages) {
          Object.keys(queryResult.pages).forEach(pageElement => {
            defaultMeta[pageElement] = queryResult.pages[pageElement]
          })
        }

        return {data: queryResult.rows, meta: defaultMeta, error: {}}
      } catch(error){
        return {error: {message: 'POSTGRESQL ERROR.' + error.message}}
      }
    }
  }
}

module.exports = RamenModel
