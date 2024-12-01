import { Body, Controller, Logger, Post } from '@nestjs/common';
import { SpinsService } from '../../services/v1/spins.service';
import { SpinsDto } from '../../dto/v1/spins.dto';

@Controller({
    version: '1',
    path: 'spins',
})
export class SpinsController {
    private readonly logger = new Logger(SpinsController.name);

    constructor(private readonly spinsService: SpinsService) { }

    @Post()
    async spins(@Body() spinsDto: SpinsDto): Promise<any> {
        this.logger.log(`Received spin request ${JSON.stringify(spinsDto)}`);
        const res = await this.spinsService.spin(spinsDto);
        this.logger.log(`Sending spin response ${JSON.stringify(res)}`);
        return res;
    }
}
