import { Injectable, Logger } from '@nestjs/common';
import { SpinsDto } from '../../dto/v1/spins.dto';
import { HttpService } from '@nestjs/axios';
import { SpinResultsDto } from '../../../../../../libs/dto/src/index';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { UserAccumulation } from '../../../../../accumulation-system/src/models/index';

@Injectable()
export class SpinsService {
    private readonly logger = new Logger(SpinsService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) { }

    /**
     * Executes a spin operation and returns the user accumulation result.
     * 
     * @param spinsDto - Data transfer object containing spin details.
     * @returns A promise that resolves to a UserAccumulation object.
     * 
     * The function performs the following steps:
     * 1. Generates spin results by calling the rollNumbers method.
     * 2. Creates a SpinResultsDto object with the userId and spin results.
     * 3. Constructs the URL for the accumulation system endpoint.
     * 4. Sends a POST request to the accumulation system with the spin results.
     * 5. Returns the data received from the accumulation system.
     */
    async spin(spinsDto: SpinsDto): Promise<UserAccumulation> {
        const spinResults = this.rollNumbers();
        const spinResultsDto = new SpinResultsDto(spinsDto.userId, spinResults);
        const url = new URL('v1/spin-results', this.configService.getOrThrow<string>('ACCUMULATION_SYSTEM_ENDPOINT'));
        const { data } = await firstValueFrom(this.httpService.post(url.toString(), spinResultsDto));
        return data;
    }

    private rollNumbers(): number[] {
        // TODO - implement rolling numbers
        return [7, 7, 7];
    }
}
