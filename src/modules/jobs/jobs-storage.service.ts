import { Injectable } from '@nestjs/common';
import { v7 as uuid } from 'uuid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { Job, JobStatus, UrlStatus } from './types';

dayjs.extend(utc);

@Injectable()
export class JobsStorageService {
  private jobList = new Map<string, Job>();

  public add(urls: string[]): string {
    const id = uuid();

    this.jobList.set(id, {
      id,
      status: JobStatus.PENDING,
      urls: urls.map((url) => ({ status: UrlStatus.PENDING, url })),
      createdAt: dayjs().utc().toDate(),
    });

    return id;
  }

  public get(id: string): Job {
    if (!this.jobList.has(id)) {
      return null;
    }

    return this.jobList.get(id);
  }

  public getList(): Job[] {
    return Array.from(this.jobList.values());
  }

  public async update(job: Job): Promise<void> {
    if (!this.jobList.has(job.id)) {
      return;
    }

    this.jobList.set(job.id, job);

    await this.randomDelay();
  }

  public updateJobStatus(id: string, status: JobStatus) {
    const job = this.jobList.get(id);

    if (job) {
      this.jobList.set(id, { ...job, status });
    }
  }

  private async randomDelay(): Promise<void> {
    const delay = Math.floor(Math.random() * 10000);

    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
