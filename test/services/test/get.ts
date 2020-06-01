import { ApiException, IService, db } from "../../../dist/index";
import User from "../../model/User";
import Knex from "knex";
/**
 * Service Test
 */

const service: IService = {
  method: ["post", "get"],
  transaction: true,
  auth: false,
  prepare: async function (input) {
    return input;
  },
  process: async function (input, OriginalInput, trx) {
    // contoh pakai objection
    // let data: User = await User
    //     .query(trx)
    //     .insert({
    //         username: 'tesobjection',
    //         email: Math.random() * 100 + '@gmail.com',
    //         password: 'tes1234'
    //     })
    // if (data.id > 20) {
    //     throw new ApiException('maksimal user hanya 20', {}, 400)

    // }

    // // contoh pakai knex
    // let data = await trx('users')
    //     .insert({
    //         username: 'tesobjection',
    //         email: Math.random() * 100 + '@gmail.com',
    //         password: 'tes1234'
    //     })

    // if (data[0] > 20) {
    //     throw new ApiException('maksimal user hanya 20', {}, 400)
    // }
    // throw new ApiException("error aja", {}, 200);
    return input;
  },
  rules: {},
};

export default service;
