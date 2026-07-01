import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './modules/jobs/jobs.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), JobsModule, HealthModule],
})
export class AppModule {}
