import { OrderBy } from "../paginate.index";

export class PaginateConfig {
    limit: number;
    limitMax: number;
    orderBy?: OrderBy;
}
