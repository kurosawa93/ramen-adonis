'use strict'

const FileProvider = use('RamenFileProvider')

class RamenFileController {
    async uploadFile({request, response}) {
        response.implicitEnd = false
        
        const result =  await FileProvider.uploadFile(request)
        if (result.error.message) {
            return response.status(500).send({
                data: null,
                meta: {
                    message: result.error.message
                }
            })
        }
        return response.status(200).send({
            data: result.data,
            meta: {
                message: 'upload successfull'
            }
        })
    }
}