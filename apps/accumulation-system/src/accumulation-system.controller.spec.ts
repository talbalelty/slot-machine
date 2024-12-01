import { Test, TestingModule } from '@nestjs/testing';
import { AccumulationSystemModule } from './accumulation-system.module';
import { AccumulationSystemController } from './accumulation-system.controller';
import { AccumulationSystemService } from './accumulation-system.service';
import { SpinResultsDto } from '@app/dto/spin-results.dto';
import { RedisClientModule } from './database/redis-client.module';

describe('AccumulationSystemController', () => {
  let accumulationSystemController: AccumulationSystemController;
  let accumulationSystemService: AccumulationSystemService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AccumulationSystemModule, RedisClientModule],
      controllers: [AccumulationSystemController],
      providers: [AccumulationSystemService],
    }).compile();

    accumulationSystemController = app.get<AccumulationSystemController>(AccumulationSystemController);
    accumulationSystemService = app.get<AccumulationSystemService>(AccumulationSystemService);
  });

  describe('root', () => {
    it('should return "OK"', () => {
      expect(accumulationSystemController.healthcheck()).toBe('OK');
    });
  });

  describe('spinResults', () => {
    it('should log and call service with spin results', async () => {
      const spinResultsDto: SpinResultsDto = { userId: '1234', spinResults: [7, 7, 7] };
      const result = { userId: '1234', points: 21, coins: 0, spins: 0, missionIndex: 0, spinInProcess: 0 };
      jest.spyOn(accumulationSystemService, 'spinResults').mockResolvedValue(result);

      expect(await accumulationSystemController.spinResults(spinResultsDto)).toBe(result);
      expect(accumulationSystemService.spinResults).toHaveBeenCalledWith(spinResultsDto);
    });
  });
});
