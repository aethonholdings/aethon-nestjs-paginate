import { ApiProperty } from "@nestjs/swagger";
import { Links, Meta } from "src/types/paginate.types"; 

export class Paginated<T> {
    @ApiProperty({
        name: "meta",
        type: Object,
        description:
            "The metadata describing the position and size of the paginated data versus the full pagination set",
        example: {
            itemsPerPage: 10,
            totalItems: 100,
            currentPage: 1,
            totalPages: 10,
            orderBy: [{ name: "ASC" }],
            where: [{ groupId: "12" }]
        }
    })
    meta: Meta;
    @ApiProperty({
        name: "data",
        type: Array,
        description: "The paginated data set",
        example: [
            {
                id: 1,
                name: "John Doe",
                email: "john@foo.org"
            }
        ]
    })
    data: T[];

    @ApiProperty({
        name: "links",
        type: Object,
        description: "The links to the first, previous, current, next, and last pages",
        example: {
            first: "http://localhost:3000/api/v1/users?page=1",
            previous: "http://localhost:3000/api/v1/users?page=1",
            current: "http://localhost:3000/api/v1/users?page=2",
            next: "http://localhost:3000/api/v1/users?page=3",
            last: "http://localhost:3000/api/v1/users?page=10"
        }
    })
    links: Links;
}
