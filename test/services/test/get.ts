import { IService } from "../../../dist/index";
import Upload from "../../middleware/Upload";
import { DB } from "../../util/CustomQuery";
/**
 * Service Test
 */

const service: IService = {
  method: ["post", "get"],
  transaction: true,
  middleware: [Upload],
  prepare: async function (input) {
    return input;
  },
  process: async function (input, OriginalInput, trx: DB, req, res) {
    return await trx.row('select * from users')
    return input
  },
  rules: {},
};

export default service;
