'use strict'

class RamenQueryResolver {
  constructor() {}
  
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
    builder.orderBy(orderBy, direction)
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
}

module.exports = RamenQueryResolver