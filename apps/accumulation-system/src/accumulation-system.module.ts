import { Module } from '@nestjs/common';
import { AccumulationSystemController } from './accumulation-system.controller';
import { AccumulationSystemService } from './accumulation-system.service';
import { RedisClientModule } from './database/redis-client.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisClientModule
  ],
  controllers: [AccumulationSystemController],
  providers: [AccumulationSystemService],
})
export class AccumulationSystemModule { }
