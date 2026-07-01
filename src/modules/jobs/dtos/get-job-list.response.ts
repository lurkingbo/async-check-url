import { JobStatus } from '../types';

export class GetJobListResponse {
  id: string;
  status: JobStatus;
  createdAt: Date;
  count: number;
  succeeded: number;
  failed: number;
}
