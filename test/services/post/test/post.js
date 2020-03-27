
/**
 * Service Test
 */

const service = {


    transaction: false,
    auth: false,
    method: 'POST',
    prepare: async function (input) {
        return input;
    },

    process: async function (input, OriginalInput, ex) {
        throw new ex('tes error')
        return input
    },
    rules: {}
}


module.exports = service