import { ApiException, IService, db } from "../../../dist/index";
/**
 * Service Test
 */

const service: IService = {
  method: ["post", "get"],
  transaction: false,
  auth: false,
  prepare: async function (input) {
    return input;
  },
  process: async function (input, OriginalInput, method, trx) {
    return input
  },
  rules: {},
};

export default service;
