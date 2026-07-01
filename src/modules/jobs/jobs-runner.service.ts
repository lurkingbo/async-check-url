import { Injectable } from '@nestjs/common';
import { JobsStorageService } from './jobs-storage.service';
import { Job, JobStatus, Url, UrlStatus } from './types';

@Injectable()
export class JobsRunnerService {
  private readonly concurrencyLimit = 5;
  private activeUrls = 0;
  private queue: Array<() => void> = [];

  constructor(private readonly jobsStorageService: JobsStorageService) {}

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

  private processUrl(job: Job, urlEntry: Url): Promise<void> {
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

  private async checkUrl(url: string) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });

      return {
        url,
        statusCode: response.status,
        success: response.ok,
      };
    } catch {
      return {
        url,
        success: false,
      };
    }
  }

  private async checkAndSaveUrl(job: Job, urlEntry: Url): Promise<void> {
    const result = await this.checkUrl(urlEntry.url);

    urlEntry.status = result.success ? UrlStatus.SUCCESS : UrlStatus.FAILED;
    urlEntry.statusCode = result.statusCode;

    await this.jobsStorageService.update(job);
  }
}
