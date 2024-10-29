import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { OrderBy, OrderByClause, Where, WhereClause } from "src/types/paginate.types";
import { PaginateConfig } from "src/classes/paginate-config.class";
import { Paginator } from "src/classes/paginator.class";
import { Request } from "express";
import { PaginatorError } from "src/classes/paginator-error.class";
import { PaginateQuery } from "src/classes/paginate-query.class";

export const GetPaginator = createParamDecorator(
    (config: PaginateConfig, ctx: ExecutionContext): Paginator => getPaginatorClass(config, ctx)
);

export const getPaginatorClass = (config: PaginateConfig, ctx: ExecutionContext): Paginator => {
    if (ctx.getType() !== "http") throw new PaginatorError("PaginateQuery decorator can only be used in HTTP context");
    const request: Request = ctx.switchToHttp().getRequest();
    if (!request) throw new PaginatorError("Request object not found");
    const query: any = request.query;

    // Validate query object - Page and Limit
    if (query?.page) query.page = parseInt(query.page);
    if (query?.limit) query.limit = parseInt(query.limit);

    // Validate query object - OrderBy clauses
    if (query?.orderBy) query.orderBy = validateOrderBy(query.orderBy);

    // Validate query object - Where clauses
    if (query?.where) query.where = validateWhere(query.where);

    let path: string = request.path;
    if (path.endsWith("/")) path = path.slice(0, -1);
    return new Paginator(config, query as PaginateQuery, path);
};

function validateOrderBy(orderBy: string[][]): OrderBy {
    if (!(orderBy instanceof Array) || (orderBy.length > 0 && !(orderBy[0] instanceof Array)))
        throw new PaginatorError("Invalid query object; orderBy parameter should be a 2D string array");
    orderBy.forEach((orderByClause: string[]) => validateOrderByClause(orderByClause));
    // validation complete, cast to OrderBy
    return orderBy as OrderBy;
}

function validateOrderByClause(orderByClause: string[]): OrderByClause {
    if (orderByClause.length !== 2)
        throw new PaginatorError("Invalid OrderByClause; should have exactly 2 string elements");
    if (!(orderByClause[1] === "ASC" || orderByClause[1] === "DESC"))
        throw new PaginatorError("Invalid query object; second element of each OrderByClause should be 'ASC' or 'DESC'");
    return orderByClause as OrderByClause;
}

function validateWhere(where: string[][]): Where {
    if (!(where instanceof Array) || (where.length > 0 && !(where[0] instanceof Array)))
        throw new PaginatorError("Invalid query object; where parameter should be a 2D string array");
    where.forEach((whereClause: string[]) => validateWhereClause(whereClause));
    // validation complete, cast to Where
    return where as Where;
}


function validateWhereClause(whereClause: string[]): WhereClause   {
    if (whereClause.length !== 2)
        throw new PaginatorError("Invalid WhereClause; should have exactly 2 string elements");
    return whereClause as WhereClause;
}
