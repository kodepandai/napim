
/**
 * Service Test
 */

const service = {


    transaction: false,
    auth: false,
    method: 'GET',
    input: function (request) {
        return JSON.parse(request.body)
    },

    prepare: async function (input) {
        return input;
    },

    process: async function (input, OriginalInput) {
        return input
    },
    validation: {}
}


module.exports = service