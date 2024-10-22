import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { PaginateConfig, PaginateQuery, Paginator } from "../paginate.index";
import { Request } from "express";

export const GetPaginator = createParamDecorator(
    <T>(config: PaginateConfig<T>, ctx: ExecutionContext): Paginator<T> => {
        if (ctx.getType() !== "http") throw new Error("PaginateQuery decorator can only be used in HTTP context");
        const request: Request = ctx.switchToHttp().getRequest();
        if (!request) throw new Error("Request object not found");
        let queryStr = JSON.stringify(request.query);
        queryStr = queryStr.replace(/\"\[/g, "[").replace(/\]\"/g, "]"); // replace single quotes added by Swagger UI bug for nested objects
        queryStr = queryStr.replace(/\\"/g, '"'); // replace escaped double quotes added by Swagger UI bug for nested objects
        let query: any = JSON.parse(queryStr);

        // the next two if statements fix another bug with the Swagger UI that does not request arrays of arrays correctly if the parent arrays
        // have only one element
        if (query?.where && query.where.length > 0 && !(query.where[0] instanceof Array))
            query.where = new Array(query.where);
        if (query?.orderBy && query.orderBy.length > 0 && !(query.orderBy[0] instanceof Array))
            query.orderBy = new Array(query.orderBy);
        let path: string = request.path;
        if (path.endsWith("/")) path = path.slice(0, -1);
        return new Paginator<T>(config, query, path);
    }
);
