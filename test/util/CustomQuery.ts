import Knex from "knex";
import { db, trx } from '../../dist/index'

export interface DB extends Knex {
    run: (sql: string, params?: []) => Promise<any>
    row: (sql: string, params?: []) => Promise<any>
}
export const extendQuery = () => {
    db.run = async (sql: any, params = []) => {
        return (trx.isTransaction ? db.raw(sql, params).transacting(trx) : db.raw(sql, params))
            .then((res: { rows: any }) => {
                return res.rows;
            }).catch((err: any) => {
                throw err;
            });
    }
    db.row = async (sql: any, params = []) => {
        return (trx.isTransaction ? db.raw(sql, params).transacting(trx) : db.raw(sql, params))
            .then((res: { rows: any }) => {
                return res.rows[0];
            }).catch((err: any) => {
                throw err;
            });
    }
}
