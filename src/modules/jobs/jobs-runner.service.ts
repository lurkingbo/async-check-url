import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';

import { Semaphore } from './semaphore';
import { JobsStorageService } from './jobs-storage.service';
import { Job, JobStatus, UrlEntry, UrlStatus } from './types';

@Injectable()
export class JobsRunnerService {
  private readonly semaphore = new Semaphore(5);

  constructor(
    private readonly jobsStorageService: JobsStorageService,
    private readonly configService: ConfigService,
  ) {}

  public run(jobId: string): void {
    void this.processJob(jobId);
  }

  public cancelJob(jobId: string): void {
    this.semaphore.cancelGroup(jobId);
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobsStorageService.get(jobId);

    if (!job || this.semaphore.isGroupCancelled(jobId)) {
      return;
    }

    this.jobsStorageService.updateJobStatus(jobId, JobStatus.IN_PROGRESS);

    await Promise.all(
      job.urls.map((urlEntry) => this.processUrl(jobId, job, urlEntry)),
    );

    if (!this.semaphore.isGroupCancelled(jobId)) {
      this.jobsStorageService.updateJobStatus(jobId, JobStatus.COMPLETED);
    }
  }

  private processUrl(
    jobId: string,
    job: Job,
    urlEntry: UrlEntry,
  ): Promise<void> {
    return this.semaphore.run({
      groupId: jobId,
      onCancel: () => this.cancelUrlIfPending(urlEntry),
      onStart: () => {
        urlEntry.status = UrlStatus.IN_PROGRESS;
      },
      task: () => this.checkAndSaveUrl(job, urlEntry),
    });
  }

  private cancelUrlIfPending(urlEntry: UrlEntry): void {
    if (urlEntry.status === UrlStatus.PENDING) {
      urlEntry.status = UrlStatus.CANCELLED;
    }
  }

  private async checkAndSaveUrl(job: Job, urlEntry: UrlEntry): Promise<void> {
    const result = await this.checkUrl(urlEntry.url);

    this.applyCheckResult(urlEntry, result);
    await this.jobsStorageService.update(job);
  }

  private applyCheckResult(
    urlEntry: UrlEntry,
    result: Omit<UrlEntry, 'status'>,
  ): void {
    Object.assign(urlEntry, {
      ...result,
      status: result.errorMessage ? UrlStatus.ERROR : UrlStatus.SUCCESS,
    });
  }

  private async checkUrl(url: string): Promise<Omit<UrlEntry, 'status'>> {
    const start = dayjs.utc().toDate();

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(this.getRequestTimeout()),
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

  private getRequestTimeout(): number {
    return Number(this.configService.getOrThrow<number>('REQUEST_TIMEOUT'));
  }
}
