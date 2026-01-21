import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Lesson } from './entities/lesson.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private lessonsRepository: Repository<Lesson>,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async create(createCourseDto: any, instructorId: string): Promise<Course> {
    const course = this.coursesRepository.create({
      ...createCourseDto,
      instructorId,
    });
    return this.coursesRepository.save(course);
  }

  async findAll(userId?: string): Promise<Course[]> {
    const courses = await this.coursesRepository.find({
      relations: ['instructor', 'lessons'],
      order: { createdAt: 'DESC' },
    });

    // Filter premium courses if user doesn't have subscription
    if (userId) {
      const hasAccess = await this.subscriptionsService.checkUserAccess(userId);
      return courses.map((course) => ({
        ...course,
        lessons: course.isPremium && !hasAccess
          ? course.lessons.filter((lesson) => !lesson.isPremium)
          : course.lessons,
      }));
    }

    // For non-authenticated users, hide premium content
    return courses.map((course) => ({
      ...course,
      lessons: course.isPremium
        ? course.lessons.filter((lesson) => !lesson.isPremium)
        : course.lessons,
    }));
  }

  async findOne(id: string, userId?: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: ['instructor', 'lessons'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // Check access for premium courses
    if (course.isPremium && userId) {
      const hasAccess = await this.subscriptionsService.checkUserAccess(userId);
      if (!hasAccess) {
        course.lessons = course.lessons.filter((lesson) => !lesson.isPremium);
      }
    } else if (course.isPremium && !userId) {
      course.lessons = course.lessons.filter((lesson) => !lesson.isPremium);
    }

    // Increment views
    course.views += 1;
    await this.coursesRepository.save(course);

    return course;
  }

  async getLesson(
    courseId: string,
    lessonId: string,
    userId?: string,
  ): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findOne({
      where: { id: lessonId, courseId },
      relations: ['course'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check premium access
    if (lesson.isPremium || lesson.course.isPremium) {
      if (!userId) {
        throw new ForbiddenException('Subscription required to access this lesson');
      }
      const hasAccess = await this.subscriptionsService.checkUserAccess(userId);
      if (!hasAccess) {
        throw new ForbiddenException('Active subscription required');
      }
    }

    return lesson;
  }

  async update(id: string, updateCourseDto: any): Promise<Course> {
    const course = await this.findOne(id);
    Object.assign(course, updateCourseDto);
    return this.coursesRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.coursesRepository.remove(course);
  }

  async addLesson(courseId: string, lessonData: any): Promise<Lesson> {
    const course = await this.findOne(courseId);
    const lesson = this.lessonsRepository.create({
      ...lessonData,
      courseId,
    });
    return this.lessonsRepository.save(lesson);
  }

  async getStats() {
    const total = await this.coursesRepository.count();
    const premium = await this.coursesRepository.count({
      where: { isPremium: true },
    });
    const active = await this.coursesRepository.count({
      where: { isActive: true },
    });

    const result = await this.coursesRepository
      .createQueryBuilder('course')
      .select('SUM(course.views)', 'totalViews')
      .addSelect('SUM(course.enrollments)', 'totalEnrollments')
      .getRawOne();

    return {
      total,
      premium,
      active,
      totalViews: parseInt(result?.totalViews || '0'),
      totalEnrollments: parseInt(result?.totalEnrollments || '0'),
    };
  }
}
