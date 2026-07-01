import { JobStatus, UrlEntry, UrlStatus } from '../types';

export class GetJobResponse {
  id: string;
  status: JobStatus;
  createdAt: Date;
  urls: UrlResponse[];
}

export class UrlResponse {
  url: string;
  start?: Date;
  end?: Date;
  duration: number;
  status: UrlStatus;
  statusCode?: number;
  statusText?: string;
  errorMessage?: string;
}
