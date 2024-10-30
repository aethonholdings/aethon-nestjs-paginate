import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { TestEntity } from "../entities/test.entity";

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
