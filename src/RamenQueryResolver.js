'use strict'

class RamenQueryResolver {
  constructor() {}

  commonQueryBuilder(builder, queryParams) {
    var reservedKeyword = ['orderBy', 'direction', 'page', 'limit', 'relations', 'lat', 'lng']

    for (let key in queryParams){
      if (key == 'relations'){
        QueryResolver.resolveRelations(builder, request.input('relations'))
      }
      else if (key == 'orderBy'){
        QueryResolver.resolveOrderBy(builder, request.input('orderBy', 'created_at'), request.input('direction', 'desc'))
      }
      else if (!reservedKeyword.includes(key)){
        QueryResolver.resolveWhere(builder, key, request.input(key))
      }
    }

    if (queryParams.hasOwnProperty('page')){
      return builder.paginate(request.input('page'), request.input('limit', 25))
    }
    return builder.fetch()
  }
  
  resolveRelations(builder, input) {
    let relations = input.split(',')
    relations.forEach(relationElement => {
      if (relationElement.includes('^')) {
        this.resolveQueryRelations(builder, relationElement)
      }
      else {
        builder.with(relationElement)
      }
    })
    return builder
  }

  resolveQueryRelations(builder, input) {
    let relationQuery = input.split('^')
    let relationName = relationQuery[0]
    relationQuery = relationQuery[1]
    relationQuery = relationQuery.split(';')

    relationQuery.forEach(queryElement => {
      let queryObject = queryElement.split(',')
      queryObject.forEach(objectElement => {
        objectElement = objectElement.split('=')
        builder.whereHas(relationName, (builder) => {
          this.resolveWhere(builder, objectElement[0], objectElement[1])
        })
      })
    })
    return builder
  }

  resolveOrderBy(builder, orderBy, direction) {
    orderBy = orderBy.split(',')
    for (const orderByEl of orderBy) {
      builder.orderBy(orderByEl, direction)
    }
    return builder
  }

  resolveWhere(builder, columnName, compareWith) {
    let operatorFirstPriority = ['>=', '<=', '!=']
    let operatorSecondPriority = ['<', '>']

    if (compareWith.includes('|')) {
      this.resolveOr(builder, columnName, compareWith)
    }
    else if (compareWith.includes('<>') && compareWith.includes('|')) {
      this.resolveOrBetween(builder, columnName, compareWith)
    }
    else if (compareWith.includes('<>')) {
      this.resolveAndBetween(builder, columnName, compareWith)
    }
    else if (compareWith.includes('%')) {
      this.resolveLike(builder, columnName, compareWith)
    }
    else if (columnName.charAt(0) === '{' && columnName.charAt(columnName.length-1) === '}') {
      this.resolveJson(builder, columnName, compareWith)
    }
    else {
      let specialOperator = false
      operatorFirstPriority.forEach(operatorElement => {
        if (compareWith.includes(operatorElement)) {
          specialOperator = operatorElement
          compareWith = compareWith.replace(operatorElement, '')
        }
      })
      operatorSecondPriority.forEach(operatorElement => {
        if (compareWith.includes(operatorElement)) {
          specialOperator = operatorElement
          compareWith = compareWith.replace(operatorElement, '')
        }
      })

      if (specialOperator) {
        this.resolveWhereWithOperator(builder, specialOperator, columnName, compareWith)
      }
      else {
        builder.where(columnName, compareWith)
      }
    }
  }

  resolveOr(builder, columnName, value) {
    value = value.replace('|', '')
    builder.orWhere((builder) => {
      builder.orWhere(columnName, value)
    })
    return builder
  }

  resolveOrBetween(builder, columnName, value) {
    value = value.split('<>')
    builder.orWhere((builder) => {
      builder.orWhere(columnName, '>', value[0].replace('|', ''))
      builder.orWhere(columnName, '<', value[1])
    })
    return builder
  }

  resolveAndBetween(builder, columnName, value) {
    value = value.split('<>')
    builder.where((builder) => {
      builder.orWhere(columnName, '>', value[0])
      builder.orWhere(columnName, '<', value[1])
    })
    return builder
  }

  resolveLike(builder, columnName, value) {
    builder.where(columnName, 'LIKE', value)
    return builder
  }

  resolveWhereWithOperator(builder, operator, columnName, value) {
    builder.where(columnName, operator, value)
    return builder
  }

  resolveJson(builder, query, value) {
    query = query.substring(1, query.length-1)
    query += ' = ?'
    builder.whereRaw(query, value)
    return builder
  }

  async saveBelongsToManyRelations(genericModel, relationName, relationData) {
    await genericModel[relationName]().sync(relationData)
  }

  async saveHasManyRelations(genericModel, relationName, relationData) {
    let relationObjs = await genericModel[relationName]().fetch()
    if (relationObjs.rows.length == 0) {
      for (const relationalData of relationData) {
        await genericModel[relationName]().create(relationalData)
      }
      return
    }

    let dataHelper = {}
    for(const relationalData of relationObjs.rows) {
      dataHelper[relationalData.id] = relationalData
    }

    for (const data of relationData) {
      if (!data.id) {
        await genericModel[relationName]().create(data)
        continue
      }

      const relationalData = dataHelper[data.id]
      Object.keys(data).forEach(key => {
        relationalData[key] = data[key]
      })
      await relationalData.save(trx)
    }
    return
  }

  async saveHasOneRelations(genericModel, relationName, relationData) {
    let relationObj = await genericModel[relationName]().fetch()
    if (!relationObj) {
        await genericModel[relationName]().create(relationData)
        return
    }

    Object.keys(relationData).forEach(key => {
      relationObj[key] = relationData[key]
    })

    await relationObj.save()
    return
  }

}

module.exports = RamenQueryResolver