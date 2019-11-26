'use strict'

const { Storage } = require('@google-cloud/storage')
const Helpers = use('Helpers')

class GoogleFileResolver {
    constructor(options) {
        const credentialsKey = Helpers.appRoot() + '/' + options.credentialsKey
        const storage = new Storage({
            projectId : options.projectId,
            keyFilename: credentialsKey
        })
        this.bucketName = options.bucketName
        this.bucket = storage.bucket(this.bucketName)
    }

    async uploadFile(request, callback) {
        let fileName = null
        let fileStream = null

        await request.multipart.file(
            'file', 
            {
                size: '10mb',
                extnames: ['png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx']
            }, 
            async (file) => {
                await file.runValidations()
                const error = file.error()
                if (error.message) {
                    callback(null, error.message)
                    return
                }

                const result = this.createFileStream(file)
                fileStream = result.stream
                fileName = result.name
            }
        )
        .process()

        fileStream.on('error', function(err) {
            callback(null, err)
        })
        fileStream.on('finish', () => {
            fileName = this.getPublicUrl(fileName)
            callback(fileName, null)
        })
    }

    createFileStream(file) {
        let objectName = file.type + '/' + Date.now() + '-' + file.clientName
        let fileData = this.bucket.file(objectName)
        let fileStream = fileData.createWriteStream({
            metadata: {
                contentType: file.headers['content-type']
            },
            resumable: false,
            public: true
        })

        file.stream.pipe(fileStream)
        return {name: objectName, stream: fileStream}
    }

    getPublicUrl(filename) {
        return 'https://storage.googleapis.com/' + this.bucketName + '/' + filename
    }
}

module.exports = GoogleFileResolver