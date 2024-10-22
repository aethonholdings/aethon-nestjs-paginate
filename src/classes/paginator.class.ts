import { Repository } from "typeorm";
import {
    Paginated,
    PaginateConfig,
    PaginateQuery,
    WhereClause,
    OrderByClause,
    OrderBy,
    Where
} from "../paginate.index";

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

// NEXT AND LAST LINKS NOT WORKING YET
// SORT FOR ARRAY NOT WORKING YET
// TEST THAT THE PAGE COUNTS WORK

export class Paginator<T> {
    private _config: PaginateConfig<T>;
    private _query: PaginateQuery;
    private _path: string;

    constructor(config: PaginateConfig<T>, query: PaginateQuery, path: string) {
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
                const findOptions = {
                    where: {},
                    order: [],
                    relations: []
                };
                this._query.where?.forEach((whereClause: WhereClause) => {
                    findOptions.where = { ...findOptions.where, [whereClause[0]]: whereClause[1] };
                });
                const queryBuilder = (source as Repository<T>).createQueryBuilder();
                this._query.orderBy?.forEach((orderBy: OrderByClause) => {
                    queryBuilder.orderBy(orderBy[0], orderBy[1]);
                });
                result = queryBuilder
                    .where(findOptions.where)
                    .getCount()
                    .then((totalItems) => {
                        paginationParams = this._getPaginationParams(totalItems);
                        return queryBuilder
                            .where(findOptions.where)
                            .skip(paginationParams.startOffset)
                            .take(paginationParams.endOffset)
                            .getMany();
                    });
            } else {
                // if the source is not a Repository, check if it is not a promise and set it up as a Promise
                if (!(source instanceof Promise)) {
                    source = Promise.resolve(source as T[]);
                }
                // the source is now a promise; chain the promise to get the total items and the paginated data
                if (source instanceof Promise) {
                    result = source
                        .then((data) => {
                            return data;
                        })
                        .then((data) => {
                            return data.filter((item) => {
                                for (let whereClause of this._query.where) {
                                    if (item[whereClause[0]] != whereClause[1]) return false;
                                }
                                return true;
                            });
                        })
                        .then((data) => {
                            paginationParams = this._getPaginationParams(data.length);
                            return data
                                .sort((a, b) => {
                                    let sort: number = 0;
                                    for (let orderByClause of this._query.orderBy) {
                                        sort =
                                            orderByClause[1] === "ASC"
                                                ? sort ||
                                                  a[orderByClause[0]] - b[orderByClause[0]] ||
                                                  a[orderByClause[0]].localeCompare(b[orderByClause[0]])
                                                : sort ||
                                                  b[orderByClause[0]] - a[orderByClause[0]] ||
                                                  b[orderByClause[0]].localeCompare(a[orderByClause[0]]);
                                    }
                                    return sort;
                                })
                                .slice(paginationParams.startOffset, paginationParams.endOffset);
                        });
                }
            }
        }
        return result.then((data) => {
            return this._package(data, paginationParams);
        });
    }

    getQuery(): PaginateQuery {
        return this._query;
    }

    getPath(): string {
        return this._path;
    }

    private _package<T>(data: T[], paginationParams: PaginationParameters): Paginated<T> {
        let append: string = "";
        console.log(this._query.orderBy);
        append = append + (this._query.orderBy.length ? `&orderBy=${JSON.stringify(this._query.orderBy)}` : "");
        append = append + (this._query.where.length ? `&where=${JSON.stringify(this._query.where)}` : "");
        const response: Paginated<T> = {
            meta: {
                itemsPerPage: paginationParams.itemsPerPage,
                totalItems: paginationParams.totalItems,
                currentPage: paginationParams.currentPage,
                totalPages: paginationParams.totalPages,
                orderBy: paginationParams.orderBy,
                where: paginationParams.where
            },
            data: data,
            links: {
                first: `${this._path}?page=1&limit=${paginationParams.itemsPerPage}${append}`,
                current: `${this._path}?page=${paginationParams.currentPage}&limit=${paginationParams.itemsPerPage}${append}`,
                last: `${this._path}?page=${paginationParams.totalPages}&limit=${paginationParams.itemsPerPage}${append}`
            }
        };
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
        if (this._query.limit) {
            if (this._query.limit < 1) itemsPerPage = this._config.limit;
            if (this._query.limit > this._config.limitMax) itemsPerPage = this._config.limitMax;
        } else {
            itemsPerPage = this._config.limit;
        }
        const totalPages = Math.ceil(totalItems / itemsPerPage) + 1;
        const currentPage = Math.max(Math.min(this._query.page || 1, totalPages), 1);
        const startOffset = (currentPage - 1) * itemsPerPage;
        const endOffset = Math.min(startOffset + itemsPerPage, totalItems);

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
}
