'use strict'

const FileProvider = use('Ramen/FileProvider')

class RamenFileController {
    constructor() {}

    async uploadFile({request, response}) {
        response.implicitEnd = false
        
        await FileProvider.uploadFile(request, (data, err) => {
            if (data) {
                return response.status(200).send({
                    data: {
                        fileUrl: data
                    },
                    meta: {
                        message: 'upload successfull'
                    }
                })
            }
            return response.status(500).send({
                data: null,
                meta: {
                    message: err
                }
            })
        })
    }
}

module.exports = RamenFileController