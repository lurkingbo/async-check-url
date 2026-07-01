import { Injectable } from '@nestjs/common';

import { JobsStorageService } from './jobs-storage.service';
import { JobsRunnerService } from './jobs-runner.service';
import { GetJobListResponse } from './dtos/get-job-list.response';
import { GetJobResponse } from './dtos/get-job.response';
import { UrlEntry, UrlStatus } from './types';
import dayjs from 'dayjs';

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

  public getJobList(): GetJobListResponse[] {
    const list = this.jobsStorageService.getList();
    const isSucceeded = (url: UrlEntry) =>
      url.status !== UrlStatus.ERROR && url.status !== UrlStatus.CANCELLED;

    return list.map(({ urls, ...item }) => ({
      ...item,
      count: urls.length,
      succeeded: urls.filter(isSucceeded).length,
      failed: urls.length - urls.filter(isSucceeded).length,
    }));
  }

  public getSpecificJob(id: string): GetJobResponse {
    const job = this.jobsStorageService.get(id);

    if (job) {
      return {
        ...job,
        urls: job.urls.map((url) => ({
          ...url,
          duration: dayjs(url.end).diff(dayjs(url.start)),
        })),
      };
    }
  }
}
