import { ApiProperty } from "@nestjs/swagger";
import { Paginated as PaginatedInterface } from "aethon-paginate-types";
import { Meta } from "./meta.class";
import { Links } from "./links.class";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";

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
}


