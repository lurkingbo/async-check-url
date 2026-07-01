import { Controller, Delete, Get, Post, Body, Param } from '@nestjs/common';

import { CreateJobDto } from './dtos/create-job.dto';
import { JobsService } from './jobs.service';
import { CreateJobResponse } from './dtos/create-job.response';
import { GetJobListResponse } from './dtos/get-job-list.response';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  public getJobList(): GetJobListResponse[] {
    return this.jobsService.getJobList();
  }

  @Get('/:id')
  public async getSpecificJob(@Param() { id }: { id: string }) {
    return this.jobsService.getSpecificJob(id);
  }

  @Post()
  public createJob(@Body() createJobDto: CreateJobDto): CreateJobResponse {
    const jobId = this.jobsService.handleCreateJob(createJobDto.urls);

    return { jobId };
  }

  @Delete('/:id')
  public async cancelJob() {}
}
