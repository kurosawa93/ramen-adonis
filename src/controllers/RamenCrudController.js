'use strict'

class RamenCrudController {
    constructor(model) {
        this.model = model
    }

    async get({ request, response }) {
        const data = await this.model.commonQueryBuilder(this.model.query(), request)
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
                message: 'data successfully queried'
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