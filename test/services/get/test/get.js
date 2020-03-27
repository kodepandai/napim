const { ApiException } = require('../../../../index')
/**
 * Service Test
 */

const service = {


    transaction: false,
    auth: false,
    prepare: async function (input) {
        return input;
    },

    process: async function (input, OriginalInput) {
        return input.id
    },
    rules: {
        code: 'required',
        tes: 'required'
    }
}


module.exports = service