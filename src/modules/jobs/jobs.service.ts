import { Injectable } from '@nestjs/common';
import { JobsStorageService } from './jobs-storage.service';
import { JobsRunnerService } from './jobs-runner.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsStorageService: JobsStorageService,
    private readonly jobsRunnerService: JobsRunnerService,
  ) {}

  public handleCreateJob(urls: string[]): string {
    const jobId = this.jobsStorageService.add(urls);

    this.jobsRunnerService.run(jobId);

    return jobId;
  }

  public getJobList() {
    const list = this.jobsStorageService.getList();

    return list.map((item) => ({ ...item, count: item.urls.length }));
  }
}
