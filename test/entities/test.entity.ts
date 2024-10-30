import { Column, Entity, PrimaryColumn } from "typeorm";

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
    @Column()
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
}
