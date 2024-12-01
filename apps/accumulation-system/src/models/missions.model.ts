export interface Missions {
    repeatedIndex: number;
    missions: Mission[];
}

export interface Mission {
    pointsGoal: number;
    rewards: Reward[];
}

export interface Reward {
    name: string;
    value: number;
}