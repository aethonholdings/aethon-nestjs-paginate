import { PaginateConfig } from "src/classes/paginate-config.class";
import { TestEntity } from "../entities/test.entity";

export type TestData = { groupIds: number[]; countPerGroup: number; data: TestEntity[] };
export const testPath: string = "https://foo/test";
const groupIds: number[] = [1, 2];
const countPerGroup: number = 10;
const testPage: number = 2;
const testLimit: number = 5;

export const getTestEntityData = (): TestData => {
    let id = 0;
    const testData = { groupIds, countPerGroup, data: Array<TestEntity>() } as TestData;

    for (const groupId of groupIds) {
        for (let i = 0; i < countPerGroup; i++) {
            testData.data.push({
                id: ++id,
                groupId,
                string: `string-${id}`,
                boolean: id % 2 === 0,
                date: new Date(`2021-01-${id}`),
                number: id
            });
        }
    }
    return testData;
};

export const testQueries: { [key: string]: any } = {
    findAll: {
        page: testPage,
        limit: testLimit
    },
    findAllWhere: {
        page: testPage,
        limit: testLimit,
        where: [["groupId", "2"]]
    },
    findAllOrderByStringDESC: {
        page: testPage,
        limit: testLimit,
        orderBy: [["string", "DESC"]]
    },
    findAllWhereOrderByNumberDESC: {
        page: testPage,
        limit: testLimit,
        where: [["groupId", "2"]],
        orderBy: [["number", "DESC"]]
    },
    findAllWhereOrderByGroupASCAndIdDESC: {
        page: testPage,
        limit: testLimit,
        orderBy: [
            ["groupId", "ASC"],
            ["id", "DESC"]
        ]
    },
    empty: {},
    findAllNegativePage: {
        page: -1,
        limit: testLimit
    },
    findAllHugePage: {
        page: 100000,
        limit: testLimit
    },
    findAllNegativeLimit: {
        page: testPage,
        limit: -1
    },
    findAllHugeLimit: {
        page: testPage,
        limit: 100000
    }
};

export const testQueriesInvalid: { [key: string]: any } = {
    findAllMalformedOrderBy: {
        page: testPage,
        limit: testLimit,
        orderBy: ["broken", "ASC"]
    },
    findAllMalformedWhere: {
        page: testPage,
        limit: testLimit,
        where: "broken"
    }
};

export const paginationConfig: PaginateConfig = {
    limit: 5,
    limitMax: 10,
    orderBy: [["id", "ASC"]]
};