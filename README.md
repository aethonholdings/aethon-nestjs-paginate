# aethon-nestjs-paginate

## Description

(Yet another) NestJS pagination add-in, composed of a decorator and associated classes. Inspired by [nestjs-paginate](https://github.com/ppetzold/nestjs-paginate), but with narrower features and simpler code.

Also allows pagination of arbitrary data held in an array or any `Promise` returning an array, not just from a database. This is useful when returning paginated data from a cache. We use this functionality in applications with significant client-side analytics that require low latency over large datasets.

## Pagination schema

The pagination schema is described in the dependency package [`aethon-paginate-types`](https://www.npmjs.com/package/aethon-paginate-types).

## Example usage

### Installation

`npm install -s aethon-nestjs-paginate`

### Configuring pagination

```
export class PaginateConfig {
    limit: number;                  // default pagination limit
    limitMax: number;               // maximum limit allowed, to throttle request
    orderBy?: OrderBy;              // default ordering of the results
    relations?: RelationshipParam[] // array defining the INNER JOINS to be performed
}

type RelationshipParam {
    joinProperty: string;           // the TypeORM join property e.g. user.group
    entityName: string;             // the TypeORM table name to join with e.g. group
}
```

### Intercepting a request with `@GetPaginator`

In the required NestJS controller endpoint, use the `@GetPaginator(config: PaginateConfig)` decorator to return an instance of the `Paginator` class that will hold the pagination query request parameters and anticipate a dataset to perform the requested query over, as follows:

```
async index(
        @GetPaginator(testDataConfig) paginator: Paginator): Promise<Paginated<TestEntity>> {
        return this.testService.findAll(paginator);
}
```

### Request format

The inbound request must conform to the `PaginateQuery` interface in [`aethon-paginate-types`](https://www.npmjs.com/package/aethon-paginate-types).

```
export interface PaginateQuery {
    page?: number;
    limit?: number;
    orderBy?: OrderBy;      // [[string, "ASC" | "DESC"]]
    where?: Where;          //  [[string, string]], with the first string being a field name and the second one the value it should be equal to
}
```

### Paginating query results

If paginating entities from a TypeORM-connected database, pass the relevant TypeORM repository to the `Paginator.run()` method in your corresponding NestJS service:

```
async findAll(paginator: Paginator): Promise<Paginated<TestEntity>> {
        const source = this.dataSource.getRepository(TestEntity);
        return paginator.run(source);
    }
```

For any generic type `T` (in this case, `TestEntity`), `source` in the above example can be any of TypeORM `Repository<T>`, an array `T[]` or a Promise returning an array `Promise<T[]>`.

## Dependencies/ extensions included

1. [TypeORM](https://typeorm.io/)

## Features set up

-   Where queries, equality only (e.g. WHERE groupId=2) with multiple AND clauses
-   Nested OrderBy queries
-   JOINs

**To do**

-   Where queries for greater than, greater or equal than etc.
-   OR clauses in Where
