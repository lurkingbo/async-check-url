export const enum JobStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export const enum UrlStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface Url {
  status: UrlStatus;
  statusCode?: number;
  url: string;
}

export interface Job {
  id: string;
  urls: Url[];
  status: JobStatus;
  createdAt: string;
}
