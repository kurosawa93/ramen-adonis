'use strict'

class LocaleUtil {
    static getLocaleData(data, locale) {
        const localeData = data.locale[locale]
        for (const key in localeData) {
            data[key] = localeData[key]
        }
        delete data['locale']
        return data
    }
}

module.exports = LocaleUtil