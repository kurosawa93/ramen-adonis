'use strict'

class RamenQueryResolver {
  constructor() {}

  static commonQueryBuilder(builder, queryParams) {
    var reservedKeyword = ['orderBy', 'direction', 'page', 'limit', 'relations', 'locale']

    for (let key in queryParams){
      if (!reservedKeyword.includes(key)){
        this.resolveOperator(builder, key, queryParams[key])
      }
    }

    if (queryParams['locale']) {
      this.resolveLocale(builder, queryParams['locale'])
    }

    if (queryParams['relations']){
      this.resolveRelations(builder, queryParams['relations'])
    }

    if (queryParams['orderBy']){
      this.resolveOrderBy(builder, queryParams['orderBy'], queryParams['direction'] ? queryParams['direction'] : 'desc')
    }

    if (queryParams['page']){
      return builder.paginate(queryParams['page'], queryParams['limit'] ? queryParams['limit'] : 25)
    }
    return builder.fetch()
  }
  
  static resolveRelations(builder, input) {
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

  static resolveQueryRelations(builder, input) {
    let relationQuery = input.split('^')
    let relationName = relationQuery[0]
    relationQuery = relationQuery[1]
    relationQuery = relationQuery.split(';')

    relationQuery.forEach(queryElement => {
      let queryObject = queryElement.split(',')
      queryObject.forEach(objectElement => {
        objectElement = objectElement.split('=')
        if (objectElement[0].includes('*')) {
          builder.with(relationName, (innerBuilder) => {
            objectElement[0] = objectElement[0].replace('*', '')
            this.resolveOperator(innerBuilder, objectElement[0], objectElement[1])
          })
        }
        else {
          builder.whereHas(relationName, (builder) => {
            this.resolveOperator(builder, objectElement[0], objectElement[1])
          })
        }
      })
    })
    return builder
  }

  static resolveOrderBy(builder, orderBy, direction) {
    orderBy = orderBy.split(',')
    for (const orderByEl of orderBy) {
      builder.orderBy(orderByEl, direction)
    }
    return builder
  }

  static resolveOperator(builder, columnName, comparevalues) {
    const comparators = comparevalues.split(',')
    if (columnName.includes('|')) {
      columnName = columnName.replace('|', '')
      builder.orWhere((orBuilder) => {
        for (const comparator of comparators) {
          this.resolveWhere(orBuilder, columnName, comparator)
        }
      })
      return
    }

    builder.where((andBuilder) => {
      for (const comparator of comparators) {
        this.resolveWhere(andBuilder, columnName, comparator)
      }
    })
    return
  }

  static resolveSpecialOperator(builder, columnName, compareWith) {
    let operatorFirstPriority = ['>=', '<=', '!=']
    let operatorSecondPriority = ['<', '>']
    let specialOperator = false

    for (const operatorElement of operatorFirstPriority) {
      if (compareWith.includes(operatorElement)) {
        specialOperator = operatorElement
        compareWith = compareWith.replace(operatorElement, '')
      }
    }

    for (const operatorElement of operatorSecondPriority) {
      if (compareWith.includes(operatorElement)) {
        specialOperator = operatorElement
        compareWith = compareWith.replace(operatorElement, '')
      }
    }

    if (!specialOperator) {
      builder.where(columnName, compareWith)
      return false
    }

    builder.where(columnName, specialOperator, compareWith)
    return true
  }

  static resolveWhere(builder, columnName, compareWith) {
    let customOperator = false

    if (compareWith.includes('<>') && compareWith.includes('|')) {
      this.resolveOrBetween(builder, columnName, compareWith)
      customOperator = true
    }
    else if (compareWith.includes('<>')) {
      this.resolveAndBetween(builder, columnName, compareWith)
      customOperator = true
    }
    else if (compareWith.includes('|')) {
      this.resolveOr(builder, columnName, compareWith)
      customOperator = true
    }
    else if (compareWith.includes('%')) {
      this.resolveLike(builder, columnName, compareWith)
      customOperator = true
    } else if (columnName.charAt(0) === '{' && columnName.charAt(columnName.length-1) === '}') {
      this.resolveJson(builder, columnName, compareWith)
      customOperator = true
    }

    if (!customOperator) {
      this.resolveSpecialOperator(builder, columnName, compareWith)
    }
  }

  static resolveOr(builder, columnName, value) {
    value = value.replace('|', '')
    builder.orWhere((builder) => {
      builder.orWhere(columnName, value)
    })
    return builder
  }

  static resolveOrBetween(builder, columnName, value) {
    value = value.split('<>')
    builder.orWhere((orBuilder) => {
      orBuilder.where(columnName, '>', value[0].replace('|', ''))
      orBuilder.where(columnName, '<', value[1])
    })
    return builder
  }

  static resolveAndBetween(builder, columnName, value) {
    value = value.split('<>')
    builder.where((andBuilder) => {
      andBuilder.where(columnName, '>', value[0])
      andBuilder.where(columnName, '<', value[1])
    })
    return builder
  }

  static resolveLike(builder, columnName, value) {
    builder.where(columnName, 'LIKE', value)
    return builder
  }

  static resolveWhereWithOperator(builder, operator, columnName, value) {
    builder.where(columnName, operator, value)
    return builder
  }

  static resolveJson(builder, query, value) {
    query = query.substring(1, query.length-1)
    query += ' = ?'
    builder.whereRaw(query, value)
    return builder
  }

  static resolveLocale(builder, locale) {
    builder.whereRaw('locale->>\'' + locale + '\' IS NOT NULL')
    return builder
  }

  static async saveBelongsToManyRelations(genericModel, relationName, relationData) {
    await genericModel[relationName]().sync(relationData)
  }

  static async saveHasManyRelations(genericModel, relationName, relationData) {
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

  static async saveHasOneRelations(genericModel, relationName, relationData) {
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