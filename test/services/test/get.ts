import { ApiException, IService } from "../../../dist/index";
import Session from "../../middleware/Session";
import Upload from "../../middleware/Upload";
/**
 * Service Test
 */

const service: IService = {
  method: ["post", "get"],
  transaction: false,
  middleware: [Upload, Session],
  prepare: async function (input) {
    return input;
  },
  process: async function (input, OriginalInput, trx) {
    return input
  },
  rules: {},
};

export default service;
