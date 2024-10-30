import { getPaginatorClass } from "src/decorators/get-paginator.decorator";
import { Paginator } from "src/classes/paginator.class";
import {
    getTestEntityData,
    paginationConfig,
    TestData,
    testPath,
    testQueries,
    testQueriesInvalid
} from "../mocks/test-data.mock";
import { ExecutionContext } from "@nestjs/common";
import { TestEntity } from "test/entities/test.entity";
import { getDbConfig } from "test/mocks/data-source.mock";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { PaginateConfig } from "src/classes/paginate-config.class";

// NEXT AND LAST LINKS NOT WORKING YET
// TEST THAT THE PAGE COUNTS WORK

type Sources = "promise" | "repository" | "array";

describe("Test GetPaginator decorator", () => {
    const config: PaginateConfig = paginationConfig;
    const testData: TestData = getTestEntityData();
    let repository: Repository<TestEntity>;
    let dataSource: DataSource;
    let entities: TestEntity[] | Promise<TestEntity[]> | Repository<TestEntity>;
    const sources: Sources[] = ["array", "promise", "repository"];
    testData.data = shuffle(testData.data);

    for (const source of sources) {
        beforeEach(async () => {
            switch (source) {
                case "promise":
                    entities = Promise.resolve(testData.data);
                    break;
                case "repository":
                    const module: TestingModule = await Test.createTestingModule({
                        imports: [TypeOrmModule.forRoot(getDbConfig()), TypeOrmModule.forFeature([TestEntity])]
                    }).compile();
                    dataSource = module.get<DataSource>(DataSource);
                    repository = dataSource.getRepository(TestEntity);
                    await repository.save(testData.data);
                    entities = repository;
                    break;
                default:
                    entities = testData.data;
            }
        });

        it(`source:${source}; returns paginated data:findAll`, async () => {
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

        it(`source:${source}; returns paginated data:findAllWhere`, async () => {
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

        it(`source:${source}; returns paginated data:findAllOrderByStringDESC`, async () => {
            const query = testQueries.findAllOrderByStringDESC;
            const paginator: Paginator = getPaginator(query);
            const paginated = await paginator.run<TestEntity>(entities);
            expect(paginated.meta.currentPage).toBe(query.page);
            for (let i = paginated.data.length - 1; i >= 0; i--) {
                expect(paginated.data[i].string).toBe(`string-${paginated.data[i].id}`);
            }
        });

        it(`source:${source}; returns paginated data:findAllWhereOrderByNumberDESC`, async () => {
            const query = testQueries.findAllWhereOrderByNumberDESC;
            const paginator: Paginator = getPaginator(query);
            const paginated = await paginator.run<TestEntity>(entities);
            expect(paginated.meta.currentPage).toBe(query.page);
            for (let i = paginated.data.length - 1; i >= 0; i--) {
                expect(paginated.data[i].number).toBe(paginated.data[i].id);
            }
        });

        it(`source:${source}; returns paginated data:findAllWhereOrderByGroupASCAndIdDESC`, async () => {
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

        it(`source:${source}; returns paginated data:empty`, async () => {
            const query = testQueries.empty;
            const paginator: Paginator = getPaginator(query);
            const paginated = await paginator.run<TestEntity>(entities);
            expect(paginated).toBeDefined();
            expect(paginated.data).toBeDefined();
            expect(paginated.data.length).not.toBe(0);
            expect(paginated.meta.itemsPerPage).toBe(config.limit);
            expect(paginated.meta.currentPage).toBe(1);
        });

        it("source:${source}; cycles through pages correctly:findAll", async () => {
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

        afterEach(async () => {
            if (source === "repository") await dataSource.destroy();
        });
    }

    for (const query in testQueries) {
        it(`produces the same output for repository as array sources: ${query}`, async () => {
            const module: TestingModule = await Test.createTestingModule({
                imports: [TypeOrmModule.forRoot(getDbConfig()), TypeOrmModule.forFeature([TestEntity])]
            }).compile();
            dataSource = module.get<DataSource>(DataSource);
            repository = dataSource.getRepository(TestEntity);
            await repository.save(testData.data);
            const paginator: Paginator = getPaginator(query);
            const paginatedRepository = await paginator.run<TestEntity>(repository);
            const paginatedArray = await paginator.run<TestEntity>(testData.data);
            expect(paginatedRepository).toEqual(paginatedArray);
        });
    }

    // test the validation of the query object with some invalid queries
    for (const key in testQueriesInvalid) {
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
