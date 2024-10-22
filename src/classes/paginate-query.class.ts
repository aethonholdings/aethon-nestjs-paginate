import { IsNumber, IsObject } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { OrderBy, OrderByClause, Where, WhereClause } from "../types/paginate.types";

export class PaginateQuery {
    @IsNumber()
    @ApiProperty({
        name: "page",
        required: false,
        type: Number,
        description:
            "The page number to retrieve.  If the query value is higher than the number of pages, the last page is returned.  If not provided or less than 1, the first page is returned."
    })
    page?: number;

    @IsNumber()
    @ApiProperty({
        name: "limit",
        required: false,
        type: Number,
        description: "The number of items to retrieve per page.  Will be capped at a server-set maximum value if higher"
    })
    limit?: number;

    @IsObject()
    @ApiProperty({
        name: "orderBy",
        required: false,
        isArray: true,
        type: Array<OrderByClause>,
        example: [
            ["name", "ASC"],
            ["groupId", "DESC"]
        ],
        description:
            "The order by clause to sort the results by; either 'ASC' or 'DESC'. If not provided, no sort is set."
    })
    orderBy?: OrderBy;

    @IsObject()
    @ApiProperty({
        name: "where",
        required: false,
        isArray: true,
        type: Array<WhereClause>,
        example: [
            ["groupId", "12"],
            ["active", "true"]
        ],
        description:
            "The where clause to filter the results by.  For each field listed, an AND operation is performed for equality against the values provided.  If no where clause is provided, all results are fetched."
    })
    where?: Where;
}
