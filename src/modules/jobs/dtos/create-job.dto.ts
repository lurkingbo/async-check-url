import { ArrayNotEmpty, IsArray, IsUrl } from 'class-validator';

export class CreateJobDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({}, { each: true })
  urls: string[];
}
