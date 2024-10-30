import { OrderBy } from "../types/paginate.types";

export class PaginateConfig {
    limit: number;
    limitMax: number;
    orderBy?: OrderBy;
}
