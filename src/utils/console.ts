import { Yellow, Green, Red, Blue } from './color'
import { TColor, TConsoleMessage } from './types'
const print = function (color: TColor, message?: TConsoleMessage) {
    if (!message) return console.log(message)
    message = <string[]>message
    console.log(color, '[napim] ' + (message.constructor == Array ? message.join('\n') : message))
}
const success = function (message: TConsoleMessage) {
    print(Green, message)
}
const warn = function (message: TConsoleMessage) {
    print(Yellow, message)
}
const error = function (message: TConsoleMessage) {
    print(Red, message)
}
const info = function (message: TConsoleMessage) {
    print(Blue, message)
}
const debug = function (message: TConsoleMessage) {
    if (!message) return console.log(message)
    message = <string[]>message
    console.log('[napim] ' + (message.constructor == Array ? message.join('\n') : message))
}

export { success, warn, error, info, debug }