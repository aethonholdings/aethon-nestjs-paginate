import { FindManyOptions, FindOptions, Repository } from "typeorm";
import { WhereClause, OrderByClause, OrderBy, Where } from "aethon-paginate-types";
import { PaginateConfig } from "./paginate-config.class";
import { Paginated } from "../classes/paginated.class";
import { PaginateQuery } from "./paginate-query.class";

type PaginationParameters = {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    startOffset: number;
    endOffset: number;
    orderBy: OrderBy;
    where: Where;
};

export class Paginator {
    private _config: PaginateConfig;
    private _query: PaginateQuery;
    private _path: string;

    constructor(config: PaginateConfig, query: PaginateQuery, path: string) {
        this._config = config;
        this._query = query;
        this._path = path;
    }

    run<T>(source: T[] | Promise<T[]> | Repository<T>): Promise<Paginated<T>> {
        let paginationParams: PaginationParameters;
        let result: Promise<T[]>;

        // check if this is a Repository instance and set up the right query
        if (source) {
            if (source instanceof Repository) {
                const findOptions: FindManyOptions = {
                    where: {},
                    order: {},
                    relations: {}
                };
                // add where clauses to the find options
                this._query.where?.forEach((whereClause: WhereClause) => {
                    findOptions.where = {
                        ...findOptions.where,
                        [whereClause[0]]: whereClause[1]
                    };
                });

                const countQuery = source.findAndCount(findOptions);
                
                // add relations to the find options
                this._config.relations?.forEach((relationship) => {
                    findOptions.relations[relationship] = true;
                });

                // add order by clauses to the find options
                this._query.orderBy?.forEach((orderBy: OrderByClause) => {
                    findOptions.order[orderBy[0]] = orderBy[1];
                })
                
                // get the total items and the paginated data
                // the total items are needed to calculate the pagination parameters
                // the result is then passed on as a promise to be packaged
                result = countQuery.then((totalItems) => {
                    paginationParams = this._getPaginationParams(totalItems[1]);
                    findOptions.skip = paginationParams.startOffset;
                    findOptions.take = paginationParams.itemsPerPage;
                    return (source as Repository<T>).find(findOptions);
                });
            } else {
                // if the source is not a Repository, check if it is not a promise and set it up as a Promise
                if (!(source instanceof Promise)) {
                    source = Promise.resolve(source);
                }
                // the source is now a promise; chain the promise to get the total items and the paginated data
                result = source
                    .then((data) => {
                        return this._query.where ? this._where(data) : data;
                    })
                    // order by id ASC, if present, because by default TypeORM orders by id
                    // this step ensures that array-based data source results match the repository-based results
                    .then((data) => {
                        return data.sort((a, b) => a["id"] - b["id"]);
                    })
                    .then((data) => {
                        return this._query.orderBy ? this._orderBy(data) : data;
                    })
                    .then((data) => {
                        paginationParams = this._getPaginationParams(data.length);
                        return data.slice(paginationParams.startOffset, paginationParams.endOffset + 1);
                    });
            }
        }
        return result.then((data) => {
            return this._package<T>(data, paginationParams);
        });
    }

    getQuery(): PaginateQuery {
        return this._query;
    }

    getPath(): string {
        return this._path;
    }

    getConfig(): PaginateConfig {
        return this._config;
    }

    private _package<T>(data: T[], paginationParams: PaginationParameters): Paginated<T> {
        let append: string = "";
        append =
            append +
            (this._query.orderBy && this._query.orderBy.length
                ? `&orderBy=${JSON.stringify(this._query.orderBy)}`
                : "");
        append =
            append +
            (this._query.where && this._query.where.length ? `&where=${JSON.stringify(this._query.where)}` : "");
        const response: Paginated<T> = {
            meta: {
                itemsPerPage: paginationParams.itemsPerPage,
                totalItems: paginationParams.totalItems,
                currentPage: paginationParams.currentPage,
                totalPages: paginationParams.totalPages
            },
            data: data.map((obj) => obj as T),
            links: {
                first: `${this._path}?page=1&limit=${paginationParams.itemsPerPage}${append}`,
                current: `${this._path}?page=${paginationParams.currentPage}&limit=${paginationParams.itemsPerPage}${append}`,
                last: `${this._path}?page=${paginationParams.totalPages}&limit=${paginationParams.itemsPerPage}${append}`
            }
        };
        if (this._query.orderBy) response.meta.orderBy = this._query.orderBy;
        if (this._query.where) response.meta.where = this._query.where;
        paginationParams.currentPage > 1
            ? (response.links.previous = `${this._path}?page=${paginationParams.currentPage - 1}&limit=${paginationParams.itemsPerPage}${append}`)
            : null;
        paginationParams.currentPage < paginationParams.totalPages
            ? (response.links.next = `${this._path}?page=${paginationParams.currentPage + 1}&limit=${paginationParams.itemsPerPage}${append}`)
            : null;
        return response;
    }

    private _getPaginationParams(totalItems: number): PaginationParameters {
        let itemsPerPage: number = this._query.limit || this._config.limit;
        if (this._query.limit < 1) itemsPerPage = this._config.limit;
        if (this._query.limit > this._config.limitMax) itemsPerPage = this._config.limitMax;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        const currentPage = Math.max(Math.min(this._query.page || 1, totalPages), 1);
        const startOffset = (currentPage - 1) * itemsPerPage;
        const endOffset = Math.min(startOffset + itemsPerPage, totalItems) - 1;

        return {
            itemsPerPage: itemsPerPage,
            totalItems: totalItems,
            currentPage: currentPage,
            totalPages: totalPages,
            orderBy: this._query.orderBy || this._config.orderBy,
            where: this._query.where,
            startOffset: startOffset,
            endOffset: endOffset
        };
    }

    private _orderBy<T>(data: T[]): T[] {
        return data.sort((a, b) => {
            let sort: number = 0;
            for (const orderByClause of this._query.orderBy) {
                if (a[orderByClause[0]] instanceof String) {
                    sort =
                        orderByClause[1] === "ASC"
                            ? sort || a[orderByClause[0]].localeCompare(b[orderByClause[0]])
                            : sort || b[orderByClause[0]]?.localeCompare(a[orderByClause[0]]);
                } else {
                    sort =
                        orderByClause[1] === "ASC"
                            ? sort || a[orderByClause[0]] - b[orderByClause[0]]
                            : sort || b[orderByClause[0]] - a[orderByClause[0]];
                }
            }
            return sort;
        });
    }

    private _where<T>(data: T[]): T[] {
        return data.filter((item) => {
            for (const whereClause of this._query.where) {
                if (item[whereClause[0]] != whereClause[1]) return false;
            }
            return true;
        });
    }
}
