import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';

import { JobsStorageService } from './jobs-storage.service';
import { Job, JobStatus, UrlEntry, UrlStatus } from './types';

@Injectable()
export class JobsRunnerService {
  private readonly concurrencyLimit = 5;
  private activeUrls = 0;
  private queue: Array<() => void> = [];

  constructor(
    private readonly jobsStorageService: JobsStorageService,
    private readonly configService: ConfigService,
  ) {}

  public run(jobId: string): void {
    void this.processJob(jobId);
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobsStorageService.get(jobId);

    if (!job) {
      return;
    }

    this.jobsStorageService.updateJobStatus(jobId, JobStatus.IN_PROGRESS);

    await Promise.all(
      job.urls.map((urlEntry) => this.processUrl(job, urlEntry)),
    );

    this.jobsStorageService.updateJobStatus(jobId, JobStatus.COMPLETED);
  }

  private processUrl(job: Job, urlEntry: UrlEntry): Promise<void> {
    return this.withLimit(() => this.checkAndSaveUrl(job, urlEntry));
  }

  private withLimit(task: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      const start = () => {
        this.activeUrls++;

        void task()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            this.activeUrls--;

            const next = this.queue.shift();
            if (next) {
              next();
            }
          });
      };

      if (this.activeUrls < this.concurrencyLimit) {
        start();
      } else {
        this.queue.push(start);
      }
    });
  }

  private async checkUrl(url: string): Promise<Omit<UrlEntry, 'status'>> {
    const start = dayjs.utc().toDate();

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(
          Number(this.configService.getOrThrow<number>('REQUEST_TIMEOUT')),
        ),
      });

      return {
        url,
        start,
        end: dayjs.utc().toDate(),
        statusCode: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      return {
        url,
        start,
        end: dayjs.utc().toDate(),
        errorMessage: JSON.stringify(error),
      };
    }
  }

  private async checkAndSaveUrl(job: Job, urlEntry: UrlEntry): Promise<void> {
    const result = await this.checkUrl(urlEntry.url);

    Object.assign(urlEntry, {
      ...result,
      status: result.errorMessage ? UrlStatus.ERROR : UrlStatus.SUCCESS,
    });

    await this.jobsStorageService.update(job);
  }
}
