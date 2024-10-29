import { getPaginatorClass } from "src/decorators/get-paginator.decorator";
import { Paginator } from "src/classes/paginator.class";
import {
    getTestEntityData,
    paginationConfig,
    TestData,
    testPath,
    testQueries,
    testQueriesInvalid
} from "../test-data/test-data";
import { ExecutionContext } from "@nestjs/common";
import { TestEntity } from "test/test-data/test.entity";

// NEXT AND LAST LINKS NOT WORKING YET
// TEST THAT THE PAGE COUNTS WORK

describe("Test GetPaginator decorator", () => {
    const config = paginationConfig;
    let testData: TestData;
    let entities: TestEntity[] | Promise<TestEntity[]>;
    const sources = ["array", "promise", "repository"];

    for (let key in testQueries) {
        const query = testQueries[key];
        it(`initialises a paginator::${key}`, () => {
            const paginator: Paginator = getPaginator(query);
            expect(paginator).toBeDefined();
        });
    }

    for (let source of sources) {
        beforeEach(async () => {
            if (source === "array" || source === "promise") {
                testData = getTestEntityData();
                source === "array"
                    ? (entities = shuffle(testData.data))
                    : (entities = Promise.resolve(testData.data).then((data) => shuffle(data)));
            }
        });

        it(`returns paginated data::findAll::source:${source}`, async () => {
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

        it(`returns paginated data::findAllWhere::source:${source}`, async () => {
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

        it(`returns paginated data::findAllOrderByStringDESC::source:${source}`, async () => {
            const query = testQueries.findAllOrderByStringDESC;
            const paginator: Paginator = getPaginator(query);
            const paginated = await paginator.run<TestEntity>(entities);
            expect(paginated.meta.currentPage).toBe(query.page);
            for (let i = paginated.data.length - 1; i >= 0; i--) {
                expect(paginated.data[i].string).toBe(`string-${paginated.data[i].id}`);
            }
        });

        it(`returns paginated data::findAllWhereOrderByNumberDESC::source:${source}`, async () => {
            const query = testQueries.findAllWhereOrderByNumberDESC;
            const paginator: Paginator = getPaginator(query);
            const paginated = await paginator.run<TestEntity>(entities);
            expect(paginated.meta.currentPage).toBe(query.page);
            for (let i = paginated.data.length - 1; i >= 0; i--) {
                expect(paginated.data[i].number).toBe(paginated.data[i].id);
            }
        });

        it(`returns paginated data::findAllWhereOrderByGroupASCAndIdDESC::source:${source}`, async () => {
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

        it(`returns paginated data::empty::source:${source}`, async () => {
            const query = testQueries.empty;
            const paginator: Paginator = getPaginator(query);
            const paginated = await paginator.run<TestEntity>(entities);
            expect(paginated).toBeDefined();
            expect(paginated.data).toBeDefined();
            expect(paginated.data.length).not.toBe(0);
            expect(paginated.meta.itemsPerPage).toBe(config.limit);
            expect(paginated.meta.currentPage).toBe(1);
        });
    }

    // test the validation of the query object with some invalid queries
    for (let key in testQueriesInvalid) {
        const query = testQueriesInvalid[key];
        it(`should throw an error for invalid query::${key}`, () => {
            expect(() => getPaginator(query)).toThrow();
        });
    }
});

// mock a context, a request query based on the test data, and return a Paginator
function getPaginator(query: any): Paginator {
    const context: ExecutionContext = jest.genMockFromModule("@nestjs/common");
    context.getType = jest.fn().mockReturnValue("http");
    context.switchToHttp = jest
        .fn()
        .mockReturnValue({ getRequest: jest.fn().mockReturnValue({ query: query, path: testPath }) });
    return getPaginatorClass(paginationConfig, context);
}

// shuffle an array to test the OrderBy functionality
function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
