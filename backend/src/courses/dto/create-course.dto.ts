import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseLevel } from '../entities/course.entity';

export class CreateCourseDto {
  @ApiProperty({ example: 'JavaScript Fundamentals' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Learn JavaScript from scratch' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'https://example.com/thumbnail.jpg', required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ enum: CourseLevel, example: CourseLevel.BEGINNER })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({ example: 99000 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
}
