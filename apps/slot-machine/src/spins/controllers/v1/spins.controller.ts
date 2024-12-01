import { Body, Controller, Post } from '@nestjs/common';
import { SpinsService } from '../../services/v1/spins.service';
import { SpinsDto } from '../../dto/v1/spins.dto';

@Controller({
    version: '1',
    path: 'spins',
})
export class SpinsController {
    constructor(private readonly spinsService: SpinsService) { }

    @Post()
    async spins(@Body() spinsDto: SpinsDto): Promise<any> {
        return await this.spinsService.spin(spinsDto);
    }
}
