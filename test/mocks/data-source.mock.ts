import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { TestEntity } from "../entities/test.entity";
import { TestRelatedEntity } from "test/entities/test-related.entity";

export const getDbConfig = (): TypeOrmModuleOptions => {
    return {
        type: "sqlite",
        database: ":memory:",
        entities: [TestEntity],
        synchronize: true,
        dropSchema: true,
        logging: false,
        keepConnectionAlive: true
    };
};
