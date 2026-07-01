import { Job, JobStatus, Url } from '../types';

export class GetJobListResponse implements Job {
  id: string;
  urls: Url[];
  status: JobStatus;
  createdAt: string;
  count: number;
}
