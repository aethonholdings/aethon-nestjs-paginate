import { ApiProperty } from "@nestjs/swagger";
import { OrderBy, OrderByClause, Where, WhereClause } from "aethon-paginate-types";
import { Meta as MetaInterface } from "aethon-paginate-types";
import { IsArray, IsNumber, IsOptional } from "class-validator";

export class Meta implements MetaInterface {
    @IsNumber()
    @ApiProperty({
        name: "itemsPerPage",
        type: Number,
        description:
            "The metadata describing the position and size of the paginated data versus the full pagination set",
        example: 10
    })
    itemsPerPage: number;

    @IsNumber()
    @ApiProperty({
        name: "totalItems",
        type: Number,
        description: "The total number of items in the paginated data set",
        example: 100
    })
    totalItems: number;

    @IsNumber()
    @ApiProperty({
        name: "currentPage",
        type: Number,
        description: "The current page number",
        example: 1
    })
    currentPage: number;

    @IsNumber()
    @ApiProperty({
        name: "totalPages",
        type: Number,
        description: "The total number of pages in the paginated data set",
        example: 10
    })
    totalPages: number;

    @IsArray()
    @IsOptional()
    @ApiProperty({
        name: "orderBy",
        isArray: true,
        type: Array<OrderByClause>,
        description: "The order by clause for the paginated data set",
        example: [["id", "ASC"]]
    })
    orderBy?: OrderBy;

    @IsArray()
    @IsOptional()
    @ApiProperty({
        name: "where",
        isArray: true,
        type: Array<WhereClause>,
        description: "The where clause for the paginated data set",
        example: [["id", "153"]]
    })
    where?: Where;
}
