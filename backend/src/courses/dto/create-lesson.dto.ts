import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LessonType } from '../entities/lesson.entity';

export class CreateLessonDto {
  @ApiProperty({ example: 'Introduction to JavaScript' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Learn the basics', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: LessonType, example: LessonType.VIDEO })
  @IsEnum(LessonType)
  type: LessonType;

  @ApiProperty({ example: 'https://example.com/video.mp4', required: false })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ example: 'Lesson content...', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  duration: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
}
