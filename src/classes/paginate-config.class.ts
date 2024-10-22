import { OrderBy } from "../paginate.index";

export class PaginateConfig<T> {
    limit: number;
    limitMax: number;
    orderBy?: OrderBy;
}
