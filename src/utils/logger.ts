import { logPath } from './path'
import moment from 'moment'
import fs from 'fs'

if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath)
}

const error = (error_data: object): void => {
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

export default { error }