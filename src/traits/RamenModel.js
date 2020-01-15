'use strict'

const QueryResolver = require('../RamenQueryResolver')
const slugify = require('slugify')

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
        return {error: {code: error.code, message: 'POSTGRESQL ERROR. ' + error.message}}
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
      if (options.slug) {
        Model.assignSlug(data, options.path, options.valuePath)
      }
      
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

    Model.getBySlugWithLocale = async function (locale, slug) {
      const query = 'locale->\'' + locale + '\'->>\'slug\' = ?'
      try {
        const result = await Model.query().whereRaw(query, slug).first()
        return {data: result, error: {}}
      }
      catch(error) {
        return {error: {message: 'POSTGRESQL ERROR ' + error.message}}
      }
    }

    Model.assignSlug = function(obj, slugPath, slugValuePath) {
      const valuePath = slugValuePath.split('.')
      let value = data
      for (let i = 0; i < valuePath.length; i++) {
        value = value[valuePath[i]]
      }
      value = slugify(value)

      const slugPath = slugPath.split('.')
      const lastIndex = slugPath.length-1
      for (let i = 0; i < lastIndex; i++) {
        const key = slugPath[i]
        if (!(key in obj)) {
          return
        }
        obj = obj[key]
      }
      obj[slugPath[lastIndex]] = value
    }
  }
}

module.exports = RamenModel
