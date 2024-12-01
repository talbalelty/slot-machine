import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AccumulationSystemModule } from './../src/accumulation-system.module';
import { AccumulationSystemService } from '../src/accumulation-system.service';

describe('AccumulationSystemController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AccumulationSystemModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({
      type: VersioningType.URI,
    });
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/v1/healthcheck (GET)', async () => {
    return await request(app.getHttpServer())
      .get('/v1/healthcheck')
      .expect(200)
      .expect('OK');
  });

  it('/v1/spin-results (POST)', async () => {
    await app.get(AccumulationSystemService).createUserAccumulation('0000'); // reset test user
    return await request(app.getHttpServer())
      .post('/v1/spin-results')
      .send({ userId: '0000', spinResults: [7, 7, 7] })
      .expect(201)
      .expect({ userId: '0000', points: 11, coins: 0, spins: 10, missionIndex: 1, spinInProcess: 0 });
  });
});
