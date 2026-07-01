import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  public getHealthCheck() {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }
}
