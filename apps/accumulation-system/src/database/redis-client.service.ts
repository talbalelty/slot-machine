import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { USER_ACCUMULATION_INDEX, userAccumulationSchema } from '../models/user-accumulation.model';

@Injectable()
export class RedisClientService implements OnApplicationBootstrap {
    client: RedisClientType;

    private readonly logger = new Logger(RedisClientService.name);

    constructor(private readonly configService: ConfigService) {
        this.client = createClient({
            password: this.configService.getOrThrow<string>('REDIS_PASSWORD'),
            socket: {
                host: this.configService.getOrThrow<string>('REDIS_HOST'),
                port: this.configService.getOrThrow<number>('REDIS_PORT'),
            }
        });
    }
    
    async onApplicationBootstrap() {
        await this.createIndexes();
    }

    async createIndexes(): Promise<any> {
        this.logger.log('RedisClientService initializing...');
        await this.client.connect();
        await this.createIndex(`idx:${USER_ACCUMULATION_INDEX}`, userAccumulationSchema, {
            ON: 'JSON',
            PREFIX: 'user-accumulation:'
        });
    }

    async search(index: string, query: string, options: any): Promise<any> {
        return await this.client.ft.search(index, query, options);
    }

    async set(index: string, docId: string, doc: any): Promise<any> {
        return await this.client.json.set(index, docId, doc);
    }

    async close(): Promise<void> {
        await this.client.disconnect();
    }

    private async createIndex(index: string, schema: any, options: any): Promise<any> {
        try {
            await this.client.ft.create(index, schema, options);
        } catch (e) {
            if (e.message === 'Index already exists') {
                this.logger.log(`${index} exists already, skipped creation.`);
            } else {
                // Something went wrong, perhaps RediSearch isn't installed...
                this.logger.error(e);
                throw e;
            }
        }
    }
}