import { readFileSync } from 'fs';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RedisClientService } from './database/redis-client.service';
import { SpinResultsDto } from '@app/dto/spin-results.dto';
import { USER_ACCUMULATION_INDEX, UserAccumulation } from './models/user-accumulation.model';
import { SpinInProcessException, NoSpinsException } from './exceptions';
import { Missions, Reward } from './models/missions.model';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AccumulationSystemService implements OnApplicationBootstrap {
    private MISSIONS: Missions;
    private readonly logger = new Logger(AccumulationSystemService.name);

    constructor(private readonly redisClientService: RedisClientService) { }

    async onApplicationBootstrap() {
        this.MISSIONS = plainToClass(Missions, JSON.parse(readFileSync('apps/accumulation-system/src/configurations/missions.json', 'utf8')));
        const validationErrors = await validate(this.MISSIONS);
        if (validationErrors.length > 0) {
            this.logger.error(`Missions configuration is invalid: ${validationErrors}`);
            throw new Error('Missions configuration is invalid');
        }
    }

    /**
     * Processes the results of a spin operation for a user.
     * 
     * This function performs the following steps:
     * 1. Retrieves the user's accumulation data.
     * 2. Checks if the user is allowed to spin.
     * 3. Handles the spin results and updates the user's accumulation data.
     * 4. Saves the updated accumulation data back to the storage.
     * 
     * @param {SpinResultsDto} spinResultsDto - Data transfer object containing the user ID and spin results.
     * @returns {Promise<UserAccumulation>} - A promise that resolves to the updated user accumulation data.
     * 
     * @throws {SpinInProcessException} - If the user is currently in the process of spinning.
     * @throws {NoSpinsException} - If the user has no spins left.
     */
    async spinResults(spinResultsDto: SpinResultsDto): Promise<UserAccumulation> {
        const userAccumulation = await this.searchUserAccumulation(spinResultsDto.userId);
        await this.isAllowedToSpin(userAccumulation);
        this.handleSpinResults(userAccumulation, spinResultsDto.spinResults);
        await this.updateUserAccumulation(userAccumulation);
        return userAccumulation;
    }

    async createUserAccumulation(userId: string): Promise<UserAccumulation> {
        const userAccumulation = {
            userId,
            spins: 1,
            coins: 0,
            points: 0,
            missionIndex: 0,
            spinInProcess: 0,
        };
        await this.redisClientService.set(`${USER_ACCUMULATION_INDEX}:${userId}`, `$`, userAccumulation);
        return userAccumulation;
    }

    /**
     * Release the user to perform another spin
     * 
     * @param userAccumulation 
     */
    private async updateUserAccumulation(userAccumulation: UserAccumulation): Promise<void> {
        userAccumulation.spinInProcess = 0; // false
        await this.redisClientService.set(`${USER_ACCUMULATION_INDEX}:${userAccumulation.userId}`, `$`, userAccumulation);
        this.logger.log(`User ${userAccumulation.userId} has completed the spin.`);
    }

    /**
     * Handles the results of a spin and updates the user's accumulation data accordingly.
     * 
     * This function checks if the spin results are a winning combination (all three results are the same).
     * If they are, it calculates the total points from the spin results and updates the user's points and mission index.
     * It also handles the rewards if the points exceed the mission's points goal.
     * 
     * @param {UserAccumulation} userAccumulation - The user's accumulation data which includes points and mission index.
     * @param {number[]} spinResults - An array of numbers representing the results of the spin.
     * @returns {UserAccumulation} - The updated user accumulation data.
     */
    private handleSpinResults(userAccumulation: UserAccumulation, spinResults: number[]): UserAccumulation {
        this.logger.log('Handling spin results...');
        if (!(spinResults[0] === spinResults[1] && spinResults[1] === spinResults[2])) { // keep it simple
            return;
        }
        let points = userAccumulation.points + spinResults.reduce((a, b) => a + b, 0);
        let missionIndex = userAccumulation.missionIndex;

        while (points > 0) {
            if (points >= this.MISSIONS.missions[missionIndex].pointsGoal) {
                this.handleRewards(userAccumulation, this.MISSIONS.missions[missionIndex].rewards);
                points -= this.MISSIONS.missions[missionIndex].pointsGoal;
                missionIndex = missionIndex + 1 >= this.MISSIONS.missions.length ? this.MISSIONS.repeatedIndex - 1 : missionIndex + 1;
            } else {
                userAccumulation.points = points;
                userAccumulation.missionIndex = missionIndex;
                points = 0;
            }
        }

        return userAccumulation;
    }

    private handleRewards(userAccumulation: UserAccumulation, rewards: Reward[]): UserAccumulation {
        for (const reward of rewards) {
            switch (reward.name) {
                case 'coins':
                    userAccumulation.coins += reward.value;
                    break;
                case 'spins':
                    userAccumulation.spins += reward.value;
                    break;
                default:
                    break;
            }
        }

        return userAccumulation;
    }

    /**
     * Checks if the user is allowed to spin.
     * 
     * This function checks if the user is currently in the process of spinning or if they have any spins left.
     * If the user is allowed to spin, it decrements the number of spins and sets the spin in process flag to true,
     * so the user cannot spin again until the current spin is completed.
     * 
     * @param {UserAccumulation} userAccumulation - The user's accumulation data which includes the spin in process flag and the number of spins.
     * 
     * @throws {SpinInProcessException} - If the user is currently in the process of spinning.
     * @throws {NoSpinsException} - If the user has no spins left.
     */
    private async isAllowedToSpin(userAccumulation: UserAccumulation): Promise<void> {
        if (userAccumulation.spinInProcess === 1) {
            throw new SpinInProcessException();
        }
        if (userAccumulation.spins === 0) {
            throw new NoSpinsException();
        }
        userAccumulation.spins -= 1;
        userAccumulation.spinInProcess = 1; // true
        await this.redisClientService.set(`${USER_ACCUMULATION_INDEX}:${userAccumulation.userId}`, `$`, userAccumulation);
        this.logger.log(`User ${userAccumulation.userId} is allowed to spin.`);
    }

    private async searchUserAccumulation(userId: string): Promise<UserAccumulation> {
        const userAccumulation = await this.redisClientService.search(`idx:${USER_ACCUMULATION_INDEX}`, `@userId:"${userId}"`, null);
        // If the user does not exist, create a new user accumulation
        if (userAccumulation.total === 0) {
            return await this.createUserAccumulation(userId);
        } else {
            return userAccumulation.documents[0].value;
        }
    }
}
