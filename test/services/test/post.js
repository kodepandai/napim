
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

    process: async function (input, OriginalInput) {
        return input
    },
    validation: {}
}


module.exports = service