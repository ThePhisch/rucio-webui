import { Ongoingrules, Usedquota } from "@/lib/core/entity/widgets";
import { faker } from "@faker-js/faker";
import { createRSEName } from "./table-fixtures";

export function fixtureOngoingrules(): Ongoingrules {
    return {
        rulename: createRSEName(),
        replicating: faker.number.int({ min: 0, max: 100 }),
        ok: faker.number.int({ min: 0, max: 100 }),
        stuck: faker.number.int({ min: 0, max: 100 }),
    }
}

export function fixtureUsedquota(): Usedquota {
    const used = faker.number.int({min: 0, max: 100})
    const quota = faker.number.int({min: used, max: used + 100})
    const total = faker.number.int({min: quota, max: quota + 100})
    return {
        rse: createRSEName(),
        used: used,
        quota: quota,
        total: total,
        exceedPermission: faker.datatype.boolean(),
    }
}