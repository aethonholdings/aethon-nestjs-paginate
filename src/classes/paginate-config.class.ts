import { OrderBy } from "aethon-paginate-types";

export class PaginateConfig {
    limit: number;
    limitMax: number;
    orderBy?: OrderBy;
    relations?: RelationshipParam[];
}

export type RelationshipParam = string;
