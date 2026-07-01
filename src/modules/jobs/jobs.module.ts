import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsStorageService } from './jobs-storage.service';
import { JobsRunnerService } from './jobs-runner.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService, JobsStorageService, JobsRunnerService]
})
export class JobsModule {}
