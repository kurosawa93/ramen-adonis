'use strict'

const { Storage } = require('@google-cloud/storage')
const Helpers = use('Helpers')

class GoogleFileResolver {
    constructor(options) {
        const credentialsKey = Helpers.appRoot() + '/' + options.credentialsKey
        console.log(credentialsKey)
        const storage = new Storage({
            projectId : options.projectId,
            keyFilename: credentialsKey
        })
        this.bucketName = options.bucketName
        this.bucket = storage.bucket(this.bucketName)
    }

    async uploadFile(request) {
        let fileName = null
        let error = null

        await request.multipart.file(
            'file', 
            {
                types: ['file'],
                size: '10mb',
                extnames: ['png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx']
            }, 
            async (file) => {
                const result = this.createFileStream(file)
                const fileStream = result.stream

                fileStream.on('error', function(err) {
                    error = err
                })
                fileStream.on('finish', () => {
                    fileName = this.getPublicUrl(result.name)
                })
            }
        )
        .process()

        if (error != null) {
            return {
                error: {
                    message: error
                }
            }
        }
        return {
            data: {
                fileUrl: fileName
            },
            error: {}
        }
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