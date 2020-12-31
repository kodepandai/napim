import { IService } from "../../../dist/index";
import Upload from "../../middleware/Upload";
/**
 * Service Test
 */

const service: IService = {
  method: ["post", "get"],
  transaction: false,
  middleware: [Upload],
  prepare: async function (input) {
    return input;
  },
  process: async function (input, OriginalInput, trx, req, res) {
    return input
  },
  rules: {},
};

export default service;
