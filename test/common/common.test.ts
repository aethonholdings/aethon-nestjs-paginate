import { ExecutionContext } from "@nestjs/common";
import { after } from "node:test";
import { Paginator } from "src/classes/paginator.class";
import { getPaginatorClass } from "src/decorators/get-paginator.decorator";
import { PaginateConfig } from "src/index";
import { TestEntity } from "test/entities/test.entity";
import { paginationConfig, TestData, testPath, testQueries, testQueriesInvalid } from "test/mocks/test-data.mock";
import { Repository } from "typeorm";

export const commonTests = (
    testData: TestData,
    config: PaginateConfig,
    entities: TestEntity[] | Promise<TestEntity[]> | Repository<TestEntity>,
    init?: () => Promise<Repository<TestEntity>>,
    teardown?: () => Promise<void>
) => {
    beforeEach(async () => {
        if (init) entities = await init();
    });

    afterEach(async () => {
        if(teardown) await teardown();
    });

    it(`returns paginated data:findAll`, async () => {
        const query = testQueries.findAll;
        const paginator: Paginator = getPaginator(query);
        const paginated = await paginator.run<TestEntity>(entities);
        expect(paginated).toBeDefined();
        expect(paginated.data).toBeDefined();
        paginated.meta.currentPage < paginated.meta.totalPages
            ? expect(paginated.data.length).toBe(query.limit)
            : expect(paginated.data.length).toBeLessThanOrEqual(query.limit);
        expect(paginated.meta.totalItems).toBe(testData.data.length);
        expect(paginated.meta.currentPage).toBe(query.page);
    });

    it(`returns paginated data:findAllWhere`, async () => {
        const query = testQueries.findAllWhere;
        const paginator: Paginator = getPaginator(query);
        const paginated = await paginator.run<TestEntity>(entities);
        expect(paginated).toBeDefined();
        expect(paginated.data).toBeDefined();
        paginated.meta.currentPage < paginated.meta.totalPages
            ? expect(paginated.data.length).toBe(query.limit)
            : expect(paginated.data.length).toBeLessThanOrEqual(query.limit);
        expect(paginated.meta.totalItems).toBe(testData.countPerGroup);
        expect(paginated.meta.totalPages).toBe(Math.ceil(testData.countPerGroup / query.limit));
        expect(paginated.meta.currentPage).toBe(query.page);
    });

    it(`returns paginated data:findAllOrderByStringDESC`, async () => {
        const query = testQueries.findAllOrderByStringDESC;
        const paginator: Paginator = getPaginator(query);
        const paginated = await paginator.run<TestEntity>(entities);
        expect(paginated.meta.currentPage).toBe(query.page);
        for (let i = paginated.data.length - 1; i >= 0; i--) {
            expect(paginated.data[i].string).toBe(`string-${paginated.data[i].id}`);
        }
    });

    it(`returns paginated data:findAllWhereOrderByNumberDESC`, async () => {
        const query = testQueries.findAllWhereOrderByNumberDESC;
        const paginator: Paginator = getPaginator(query);
        const paginated = await paginator.run<TestEntity>(entities);
        expect(paginated.meta.currentPage).toBe(query.page);
        for (let i = paginated.data.length - 1; i >= 0; i--) {
            expect(paginated.data[i].number).toBe(paginated.data[i].id);
        }
    });

    it(`returns paginated data:findAllWhereOrderByGroupASCAndIdDESC`, async () => {
        const query = testQueries.findAllWhereOrderByGroupASCAndIdDESC;
        const paginator: Paginator = getPaginator(query);
        const paginated = await paginator.run<TestEntity>(entities);
        expect(paginated.meta.totalItems).toBe(testData.data.length);
        expect(paginated.meta.currentPage).toBe(query.page);
        for (let i = 0; i < paginated.data.length - 2; i++) {
            expect(paginated.data[i].groupId).toBe(paginated.data[i + 1].groupId);
            expect(paginated.data[i].id).toBeGreaterThan(paginated.data[i + 1].id);
        }
    });

    it(`returns paginated data:empty`, async () => {
        const query = testQueries.empty;
        const paginator: Paginator = getPaginator(query);
        const paginated = await paginator.run<TestEntity>(entities);
        expect(paginated).toBeDefined();
        expect(paginated.data).toBeDefined();
        expect(paginated.data.length).not.toBe(0);
        expect(paginated.meta.itemsPerPage).toBe(config.limit);
        expect(paginated.meta.currentPage).toBe(1);
    });

    it("cycles through pages correctly:findAll", async () => {
        let elementCounter: number = 0;
        const query = testQueries.findAll;
        query.page = 1;
        const paginator: Paginator = getPaginator(query);
        const paginated = await paginator.run<TestEntity>(entities);
        expect(paginated.meta.currentPage).toBe(query.page);
        expect(paginated.meta.itemsPerPage).toBeLessThanOrEqual(paginated.data.length);
        elementCounter += paginated.data.length;
        for (let i = paginated.meta.currentPage + 1; i <= paginated.meta.totalPages; i++) {
            query.page = i;
            const paginator: Paginator = getPaginator(query);
            const paginated = await paginator.run<TestEntity>(entities);
            expect(paginated.meta.currentPage).toBe(i);
            expect(paginated.data.length).toBeLessThanOrEqual(paginated.meta.itemsPerPage);
            elementCounter += paginated.data.length;
        }
        expect(elementCounter).toBe(testData.data.length);
    });

    // test the validation of the query object with some invalid queries
    for (const key in testQueriesInvalid) {
        const query = testQueriesInvalid[key];
        it(`should throw an error for invalid query::${key}`, () => {
            expect(() => getPaginator(query)).toThrow();
        });
    }

    // ensure the edge case of empty data return is handled with the right page count
    it("has consistent meta.currentPage and meta.totalPages===1 for empty queries", async () => {
        const query = testQueries.empty;
        const paginator: Paginator = getPaginator(query);
        const paginated = await paginator.run<TestEntity>(new Array<TestEntity>());
        expect(paginated.meta.totalItems).toBe(0);
        expect(paginated.data.length).toBe(0);
        expect(paginated.meta.currentPage).toBe(1);
        expect(paginated.meta.totalPages).toBe(1);
    });
};

// mock a context, a request query based on the test data, and return a Paginator
export function getPaginator(query: any): Paginator {
    const context: ExecutionContext = jest.genMockFromModule("@nestjs/common");
    context.getType = jest.fn().mockReturnValue("http");
    context.switchToHttp = jest
        .fn()
        .mockReturnValue({ getRequest: jest.fn().mockReturnValue({ query: query, path: testPath }) });
    return getPaginatorClass(paginationConfig, context);
}
