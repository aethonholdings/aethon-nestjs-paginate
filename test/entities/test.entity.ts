import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { TestRelatedEntity } from "./test-related.entity";

export type TestType = {
    id: number;
    groupId: number;
    string: string;
    boolean: boolean;
    date: Date;
    number: number;
};

@Entity()
export class TestEntity implements TestType {
    @PrimaryColumn()
    id: number;

    @Column()
    groupId: number;

    @Column()
    string: string;

    @Column()
    boolean: boolean;

    @Column()
    date: Date;

    @Column()
    number: number;

    @ManyToOne(() => TestRelatedEntity, (testRelatedEntity) => testRelatedEntity.entities)
    related: TestRelatedEntity;
    
}
