'use strict'

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
        
        for (const element of data.data) {
            element = element.toJSON()
            const data = element.locale[locale]
            for (const key in data) {
                element[key] = data[key]
            }
            delete element['locale']
        }
        return response.status(200).send({
            data: data.data,
            meta: data.meta
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