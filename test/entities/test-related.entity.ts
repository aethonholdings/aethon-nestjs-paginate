import { Entity, OneToMany, PrimaryColumn } from "typeorm";
import { TestEntity } from "./test.entity";

@Entity()
export class TestRelatedEntity {
    @PrimaryColumn()
    id: number;

    @OneToMany(() => TestEntity, (testEntity) => testEntity.related)
    entities: TestEntity[];
}