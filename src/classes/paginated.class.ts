import { ApiProperty } from "@nestjs/swagger";
import { Paginated as PaginatedInterface } from "aethon-paginate-types";
import { Meta } from "./meta.class";
import { Links } from "./links.class";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { PaginationParameters } from "../types/paginate.types";

export class Paginated<T> implements PaginatedInterface<T> {
    @ValidateNested({ each: true })
    @Type(() => Meta)
    @ApiProperty({
        name: "meta",
        type: Meta
    })
    meta: Meta;

    // this needs fixing
    @ApiProperty({
        name: "data",
        type: Array,
        description: "The paginated data set of generic type T",
        example: [
            {
                id: 1,
                name: "John Doe",
                email: "john@foo.org"
            }
        ]
    })
    data: T[];

    @ValidateNested({ each: true })
    @Type(() => Links)
    @ApiProperty({
        name: "links",
        type: Links,
        description: "The links to the first, previous, current, next, and last pages",
        required: true
    })
    links: Links;

    constructor(data: T[], paginationParams: PaginationParameters) {
        let append: string = "";
        append =
            append +
            (paginationParams.query.orderBy && paginationParams.query.orderBy.length
                ? `&orderBy=${JSON.stringify(paginationParams.query.orderBy)}`
                : "");
        append =
            append +
            (paginationParams.query.where && paginationParams.query.where.length
                ? `&where=${JSON.stringify(paginationParams.query.where)}`
                : "");
        const params: Paginated<T> = {
            meta: {
                itemsPerPage: paginationParams.itemsPerPage,
                totalItems: paginationParams.totalItems,
                currentPage: paginationParams.currentPage,
                totalPages: paginationParams.totalPages
            },
            data: data.map((obj) => obj as T),
            links: {
                first: `${paginationParams.path}?page=1&limit=${paginationParams.itemsPerPage}${append}`,
                current: `${paginationParams.path}?page=${paginationParams.currentPage}&limit=${paginationParams.itemsPerPage}${append}`,
                last: `${paginationParams.path}?page=${paginationParams.totalPages}&limit=${paginationParams.itemsPerPage}${append}`
            }
        };
        if (paginationParams.query.orderBy) params.meta.orderBy = paginationParams.query.orderBy;
        if (paginationParams.query.where) params.meta.where = paginationParams.query.where;
        paginationParams.currentPage > 1
            ? (params.links.previous = `${paginationParams.path}?page=${paginationParams.currentPage - 1}&limit=${paginationParams.itemsPerPage}${append}`)
            : null;
        paginationParams.currentPage < paginationParams.totalPages
            ? (params.links.next = `${paginationParams.path}?page=${paginationParams.currentPage + 1}&limit=${paginationParams.itemsPerPage}${append}`)
            : null;
        this.meta = params.meta;
        this.data = params.data;
        this.links = params.links;
    }
}
