import { SchemaFieldTypes } from 'redis';

export const USER_ACCUMULATION_INDEX = 'user-accumulation';

export const userAccumulationSchema = {
    '$.userId': {
        type: SchemaFieldTypes.TEXT,
        length: 4,
        AS: 'userId',
    },
    '$.spins': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'spins',
    },
    '$.coins': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'coins',
    },
    '$.points': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'points',
    },
    '$.missionIndex': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'missionIndex',
    },
    '$.spinInProcess': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'spinInProcess',
    },
}

export class UserAccumulation {
    userId: string;
    spins: number;
    coins: number;
    points: number;
    missionIndex: number;
    spinInProcess: number; // 1 = true, 0 = false
}