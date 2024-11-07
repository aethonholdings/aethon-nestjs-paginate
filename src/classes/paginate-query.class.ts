import { IsArray, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import {
    OrderBy,
    OrderByClause,
    Where,
    WhereClause,
    PaginateQuery as PaginateQueryInterface
} from "aethon-paginate-types";

export class PaginateQuery implements PaginateQueryInterface {
    @IsNumber()
    @IsOptional()
    @ApiProperty({
        name: "page",
        required: false,
        type: Number,
        description:
            "The page number to retrieve.  If the query value is higher than the number of pages, the last page is returned.  If not provided or less than 1, the first page is returned.",
        example: 2
    })
    page?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        name: "limit",
        required: false,
        type: Number,
        description:
            "The number of items to retrieve per page.  Will be capped at a server-set maximum value if higher",
        example: 10
    })
    limit?: number;

    @IsArray()
    @IsOptional()
    @ApiProperty({
        name: "orderBy",
        required: false,
        isArray: true,
        type: Array<OrderByClause>,
        example: [["id", "ASC"]],
        description:
            "The order by clause to sort the results by; either 'ASC' or 'DESC'. If not provided, no sort is set."
    })
    orderBy?: OrderBy;

    @IsArray()
    @IsOptional()
    @ApiProperty({
        name: "where",
        required: false,
        isArray: true,
        type: Array<WhereClause>,
        example: [["id", "=", "12"]],
        description:
            "The where clause to filter the results by.  For each field listed, an AND operation is performed for equality against the values provided.  If no where clause is provided, all results are fetched."
    })
    where?: Where;
}
