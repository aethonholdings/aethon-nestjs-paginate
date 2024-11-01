import { PaginateConfig } from "src/index";
import { getTestEntityData, paginationConfig, TestData } from "test/mocks/test-data.mock";
import { commonTests } from "../common/common.test";

describe("Array tests", () => {
    const config: PaginateConfig = paginationConfig;
    const testData: TestData = getTestEntityData();

    describe("Common tests, array source", () => commonTests(testData, config, testData.data));
});
