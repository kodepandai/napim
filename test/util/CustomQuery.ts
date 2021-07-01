import Knex from "knex";
import {getDB} from "napim";

export interface DB extends Knex {
    run: (sql: string, params?: []) => Promise<any>
    row: (sql: string, params?: []) => Promise<any>
}
const CustomQuery = () => {
    const db = getDB()
    db.run = async (sql: any, params = []) => {
        return db.raw(sql, params)
            .then((res: { rows: any }) => {
                return res.rows;
            }).catch((err: any) => {
                throw err;
            });
    }
    db.row = async (sql: any, params = []) => {
        const db = getDB()
        return  db.raw(sql, params)
            .then((res: { rows: any }) => {
                return res.rows[0];
            }).catch((err: any) => {
                throw err;
            });
    }
}
export default CustomQuery