import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AccumulationSystemService } from './accumulation-system.service';
import { SpinResultsDto } from '../../../libs/dto/src/index';

@Controller({
    version: '1',
})
export class AccumulationSystemController {
    private readonly logger = new Logger(AccumulationSystemController.name);

    constructor(private readonly accumulationSystemService: AccumulationSystemService) { }

    @Get('/healthcheck')
    healthcheck(): string {
        return 'OK';
    }

    @Post('spin-results')
    async spinResults(@Body() spinResultsDto: SpinResultsDto): Promise<any> {
        this.logger.log(`Received spin results ${JSON.stringify(spinResultsDto)}`);
        return await this.accumulationSystemService.spinResults(spinResultsDto);
    }
}
