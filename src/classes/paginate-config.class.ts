import { OrderBy } from "aethon-paginate-types";

export class PaginateConfig {
    limit: number;
    limitMax: number;
    orderBy?: OrderBy;
}
