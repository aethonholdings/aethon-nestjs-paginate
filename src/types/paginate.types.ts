export type OrderBy = OrderByClause[];
export type OrderByClause = [string, Order];
export type Order = "ASC" | "DESC";
export type Where = WhereClause[];
export type WhereClause = [string, string];

export type Meta = {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    orderBy?: OrderBy;
    where?: Where;
};

export type Links = {
    first?: string;
    previous?: string;
    current: string;
    next?: string;
    last?: string;
}
