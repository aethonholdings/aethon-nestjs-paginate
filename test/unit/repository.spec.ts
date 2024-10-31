import { PaginateConfig, Paginator } from "src/index";
import { getTestEntityData, paginationConfig, TestData, testQueries, testRelatedEntity } from "test/mocks/test-data.mock";
import { commonTests, getPaginator } from "../common/common.test";
import { DataSource, Repository } from "typeorm";
import { TestEntity } from "test/entities/test.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getDbConfig } from "test/mocks/data-source.mock";

describe("Repository tests", () => {
    const config: PaginateConfig = paginationConfig;
    const testData: TestData = getTestEntityData();
    let dataSource: DataSource;
    let repository: Repository<TestEntity>;

    const init = async () => {
        let repo: Repository<TestEntity>;
        const module: TestingModule = await Test.createTestingModule({
            imports: [TypeOrmModule.forRoot(getDbConfig()), TypeOrmModule.forFeature([TestEntity])]
        }).compile();
        dataSource = module.get<DataSource>(DataSource);
        repo = dataSource.getRepository(TestEntity);
        await repo.save(testData.data);
        return repo;
    };

    describe("Common tests, Repository source", () => commonTests(testData, config, repository, init));

    beforeEach(async () => repository = await init());

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

    afterAll(async () => {
        await dataSource.destroy();
    });
});
