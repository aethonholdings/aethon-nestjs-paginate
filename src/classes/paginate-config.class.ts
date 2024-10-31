import { OrderBy } from "aethon-paginate-types";

export class PaginateConfig {
    limit: number;
    limitMax: number;
    orderBy?: OrderBy;
    relationships?: Relationship[];
}

export class Relationship {
    joinProperty: string;
    entityName: string;
}
