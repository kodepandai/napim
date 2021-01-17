import { IService, db, ApiException } from "../../../dist/index";
import Upload from "../../middleware/Upload";
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
  process: async function (input, OriginalInput, trx, req, res) {
    if (input.insert) {
      await db.run(`INSERT INTO users(username, email, password, created_at, updated_at) VALUES ('admin${new Date().getTime()}', 'admin${new Date().getTime()}@tes.com', 'asasdasd', '2020-01-10', '2020-01-10')`)
    }
    if (input.error) {
      throw new ApiException('ERRORRR')
    }
    return await db.row('select * from users')
  },
  rules: {},
}
export default service;
