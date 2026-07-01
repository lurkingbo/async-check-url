export const enum JobStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export const enum UrlStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  CANCELLED = 'CANCELLED',
}

export interface UrlEntry {
  status: UrlStatus;
  statusCode?: number;
  statusText?: string;
  errorMessage?: string;
  start?: Date;
  end?: Date;
  url: string;
}

export interface Job {
  id: string;
  urls: UrlEntry[];
  status: JobStatus;
  createdAt: Date;
}
