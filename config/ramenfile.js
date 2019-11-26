'use strict'

const Env = use('Env')

module.exports = {
    provider: Env.get('RAMEN_FILE_PROVIDER', 'google'),
    google: {
        bucketName: Env.get('GOOGLE_BUCKET_NAME'),
        projectId: Env.get('GOOGLE_PROJECT_ID'),
        credentialsKey: Env.get('GOOGLE_CREDENTIALS_FILE')
    }
}