import { TestEntity } from "./test.entity";

export const getTestData = (): TestEntity[] => {
    let id = 1;
    const countPerGroup = 10;
    const data: TestEntity[] = [];
    for (const groupId of [1, 2]) {
        for (let i = 0; i < countPerGroup; i++) {
            data.push({
                id: id++,
                groupId,
                string: `string-${id}`,
                boolean: id % 2 === 0,
                date: new Date(`2021-01-${id}`),
                number: id
            });
        }
    }
    return data;
};
