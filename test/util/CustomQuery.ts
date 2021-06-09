import Knex from "knex";
import { db, trx } from "napim/dist/core/ServiceProvider";

export interface DB extends Knex {
    run: (sql: string, params?: []) => Promise<any>
    row: (sql: string, params?: []) => Promise<any>
}
const CustomQuery = () => {
    db.run = async (sql: any, params = []) => {
        return (trx.isTransaction ? db.raw(sql, params).transacting(trx) : db.raw(sql, params))
            .then((res: any[]) => {
                return res;
            }).catch((err: any) => {
                throw err;
            });
    }
    db.row = async (sql: any, params = []) => {
        return (trx.isTransaction ? db.raw(sql, params).transacting(trx) : db.raw(sql, params))
            .then((res: any[]) => {
                return res[0];
            }).catch((err: any) => {
                throw err;
            });
    }
}
export default CustomQuery