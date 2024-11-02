import { ApiProperty } from "@nestjs/swagger";
import { Links as LinksInterface } from "aethon-paginate-types";
import { IsOptional, IsString } from "class-validator";

export class Links implements LinksInterface {
    @IsString()
    @ApiProperty({
        name: "first",
        type: String,
        required: true,
        description: "The link to the first page",
        example: "http://localhost:3000/api/v1/users?page=1"
    })
    first: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        name: "previous",
        type: String,
        required: false,
        description: "The link to the previous page",
        example: "http://localhost:3000/api/v1/users?page=2"
    })
    previous?: string;

    @IsString()
    @ApiProperty({
        name: "current",
        type: String,
        required: true,
        description: "The link to the current page",
        example: "http://localhost:3000/api/v1/users?page=3"
    })
    current: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        name: "next",
        type: String,
        required: false,
        description: "The link to the next page",
        example: "http://localhost:3000/api/v1/users?page=4"
    })
    next?: string;

    @IsString()
    @ApiProperty({
        name: "last",
        type: String,
        required: true,
        description: "The link to the last page",
        example: "http://localhost:3000/api/v1/users?page=10"
    })
    last: string;
}
