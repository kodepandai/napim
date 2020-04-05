import { Request } from 'express'
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
    prepare(input: any | any[], tsx?: any): object,
    process(input: any, originalInput: any, tsx?: any): object,
    rules: object
}
export interface IErrorData {
    type: string,
    detail: string
}
export type TNext = (input: any) => object
export interface IMiddleware {
    before(req: Request, service: IService, input: any, next: TNext): void,
    after(req: Request, service: IService, input: any): void
}
export interface IGmInstance {
    name: string,
    instance: IMiddleware
}