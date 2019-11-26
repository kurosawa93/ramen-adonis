'use strict'

module.exports = {
    provider: process.env.FILE_PROVIDER,
    google: {
        bucketName: process.env.GOOGLE_BUCKET_NAME,
        projectId: process.env.GOOGLE_PROJECT_ID,
        credentialsKey: process.env.GOOGLE_CREDENTIALS_FILE
    }
}