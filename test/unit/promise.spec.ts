import { PaginateConfig } from "src/index";
import { getTestEntityData, paginationConfig, TestData } from "test/mocks/test-data.mock";
import { commonTests } from "../common/common.test";

describe("Promise tests", () => {

    const config: PaginateConfig = paginationConfig;
    const testData: TestData = getTestEntityData();

    describe("Common tests, promise source", () => commonTests(testData, config, Promise.resolve(testData.data)));
    
});
