import { OrderBy, Where } from "aethon-paginate-types";
import { PaginateQuery } from "../classes/paginate-query.class";

export type PaginationParameters = {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    startOffset: number;
    endOffset: number;
    orderBy: OrderBy;
    where: Where;
    query: PaginateQuery;
    path: string;
};
