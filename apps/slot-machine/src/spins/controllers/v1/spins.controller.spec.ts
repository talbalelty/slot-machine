import { Test, TestingModule } from '@nestjs/testing';
import { SpinsController } from './spins.controller';
import { SpinsService } from '../../services/v1/spins.service';
import { SpinsDto } from '../../dto/v1/spins.dto';

describe('SpinsController', () => {
    let spinsController: SpinsController;
    let spinsService: SpinsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SpinsController],
            providers: [
                {
                    provide: SpinsService,
                    useValue: {
                        spin: jest.fn().mockResolvedValue({ result: 'spin result' }),
                    },
                },
            ],
        }).compile();

        spinsController = module.get<SpinsController>(SpinsController);
        spinsService = module.get<SpinsService>(SpinsService);
    });

    it('should be defined', () => {
        expect(spinsController).toBeDefined();
    });

    it('should call SpinsService.spin with correct parameters', async () => {
        const spinsDto: SpinsDto = { userId: '1234' };
        await spinsController.spins(spinsDto);
        expect(spinsService.spin).toHaveBeenCalledWith(spinsDto);
    });

    it('should return the result from SpinsService.spin', async () => {
        const spinsDto: SpinsDto = { userId: '1234' };
        const result = await spinsController.spins(spinsDto);
        expect(result).toEqual({ result: 'spin result' });
    });
});
