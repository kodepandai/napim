const { logPath } = require('./path')
const moment = require('moment')
const fs = require('fs')

if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath)
}
const error = (error_data) => {
    let time = moment().format('YYYY-MM-DD')
    let error_file = logPath + '/' + time + '-error.json'
    try {
        require(error_file)
    } catch (error) {
        fs.writeFileSync(error_file, "[]")
    }
    let last = require(error_file)
    error_data = { time: new Date(), error: error_data }
    last.push(error_data)
    fs.writeFile(error_file, JSON.stringify(last, null, 2), () => { })
}

module.exports = { error }