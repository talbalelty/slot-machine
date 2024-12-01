import { Module } from '@nestjs/common';
import { SpinsController } from './controllers/v1/spins.controller';
import { SpinsService } from './services/v1/spins.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SpinsController],
  providers: [SpinsService, ConfigService],
})
export class SpinsModule { }
