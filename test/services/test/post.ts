import { ApiException, db, IService } from '../../../dist/index'
import Knex from 'knex';
/**
 * Service Test
 */

const service: IService = {
    method: ['post'],
    transaction: true,
    auth: false,
    prepare: async function (input) {
        return input;
    },
    process: async function (input, OriginalInput, trx) {
        let data = await trx('users')
            .insert({
                username: 'tes',
                email: Math.random() * 100 + '@gmail.com',
                password: 'tes'
            })
        // console.log('data[0] adalah', data[0]);

        // if (data[0] > 20) {
        //     throw new ApiException('error ceritanya')
        // }
        return await db('users').select('*')
    },
    rules: {

    }
}

export default service
