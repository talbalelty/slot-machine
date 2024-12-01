import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class Missions {
    @IsNumber()
    @IsNotEmpty()
    repeatedIndex: number;

    @IsArray()
    missions: Mission[];
}

export class Mission {
    @IsNumber()
    @IsNotEmpty()
    pointsGoal: number;

    @IsArray()
    rewards: Reward[];
}

export class Reward {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    value: number;
}