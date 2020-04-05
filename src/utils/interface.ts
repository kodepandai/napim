export interface IRoutes {
    post?: object[],
    get?: object[],
    delete?: object[],
    put?: object[],
    middleware: string[]
}
export interface IRoute {
    path: string,
    service: string
}
export interface IService {
    transaction: boolean,
    auth?: boolean,
    prepare: Function,
    process: Function,
    rules: Object
}
export interface IErrorData {
    type: string,
    detail: string
}
export interface IGmInstance {
    name: string,
    instance: { before: Function, after: Function }
}