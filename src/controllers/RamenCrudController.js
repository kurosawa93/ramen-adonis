'use strict'

const LocaleUtil = require('../utils/LocaleUtil')

class RamenCrudController {
    constructor(model) {
        this.model = model
    }

    async get({ request, response }) {
        const data = await this.model.commonQueryBuilder(this.model.query(), request.all())
        if (data.error.message) {
            return response.status(500).send({
                data: null,
                meta: {
                    message: data.error.message
                }
            })
        }
        return response.status(200).send({
            data: data.data,
            meta: data.meta
        })
    }

    async getWithLocale({request, params, response}) {
        const locale = params.locale
        let queryParams = request.all()
        queryParams.locale = locale

        const data = await this.model.commonQueryBuilder(this.model.query(), queryParams)
        if (data.error.message) {
            return response.status(500).send({
                data: null,
                meta: {
                    message: data.error.message
                }
            })
        }
        
        let result = []
        for (let element of data.data) {
            result.push(LocaleUtil.getLocaleData(element.toJSON(), locale))
        }
        return response.status(200).send({
            data: result,
            meta: data.meta
        })
    }

    async getBySlugWithLocale({params, response}) {
        const locale = params.locale
        const slug = params.slug
        const data = await this.model.getBySlugWithLocale(locale, slug)
        if (data.error.message) {
            return response.status(500).send({
                data: null,
                meta: {
                    message: data.error.message
                }
            })
        }
        if (!data.data) {
            return response.status(404).send({
                data: null,
                meta: {
                    message: 'Data not found'
                }
            })
        }
        return response.status(200).send({
            data: LocaleUtil.getLocaleData(data.data.toJSON(), locale),
            meta: {
                message: 'Data successfully retrieved'
            }
        })
    }

    async create({ request, response }) {
        const data = await this.model.upsert(request.body)
        if (data.error.message) {
            return response.status(500).send({
                data: null,
                meta: {
                    message: data.error.message
                }
            })
        }
        return response.status(200).send({
            data: data.data,
            meta: {
                message: 'data successfully created'
            }
        })
    }

    async update({ request, params, response }) {
        let body = request.body
        body.id = params.id

        const data = await this.model.upsert(body)
        if (data.error.message) {
            return response.status(500).send({
                data: null,
                meta: {
                    message: data.error.message
                }
            })
        }
        return response.status(200).send({
            data: data.data,
            meta: {
                message: 'data successfully updated'
            }
        })
    }

    async upsert({ request, params, response }) {
        const body = request.body
        for (const key in params) {
            body[key] = params[key]
        }

        const data = await this.model.upsert(body)
        if (data.error.message) {
            return response.status(500).send({
                data: null,
                meta: {
                    message: data.error.message
                }
            })
        }
        return response.status(200).send({
            data: data.data,
            meta: {
                message: 'data successfully updated'
            }
        })
    }

    async delete({ request, params, response}) {
        const id = params.id
        const deletedData = await this.model.deleteData(id)
        if (deletedData.error.message) {
            return response.status(500).send({
                data: null,
                meta: {
                    message: data.error.message
                }
            })
        }
        return response.status(200).send({
            data: deletedData,
            meta: {
                message: 'data successfully deleted'
            }
        })
    }
}

module.exports = RamenCrudController