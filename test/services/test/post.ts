import { IService } from 'napim';
/**
 * Service Test
 */

const service: IService = {
    method: ['post'],
    transaction: false,
    prepare: async function (input) {
        return input;
    },
    process: async function (input, OriginalInput, trx) {
        return input
    },
    rules: {

    }
}

export default service
