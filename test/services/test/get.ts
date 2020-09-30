import { ApiException, IService, db } from "../../../dist/index";
import User from "../../model/mongo/User";
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
  process: async function (input, OriginalInput, trx) {
    return await User.find()
  },
  rules: {},
};

export default service;
