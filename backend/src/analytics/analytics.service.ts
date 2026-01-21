import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { Course } from '../courses/entities/course.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Total revenue
    const totalRevenueResult = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    // Monthly revenue
    const monthlyRevenueResult = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('payment.createdAt >= :start', { start: startOfMonth })
      .getRawOne();

    // Yearly revenue
    const yearlyRevenueResult = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('payment.createdAt >= :start', { start: startOfYear })
      .getRawOne();

    // Counts
    const totalUsers = await this.usersRepository.count();
    const activeSubscriptions = await this.subscriptionsRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });
    const totalCourses = await this.coursesRepository.count();
    const totalPayments = await this.paymentsRepository.count({
      where: { status: PaymentStatus.COMPLETED },
    });

    // Revenue by payment method
    const revenueByMethod = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('payment.method', 'method')
      .addSelect('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .groupBy('payment.method')
      .getRawMany();

    // Revenue by month (last 12 months)
    const revenueByMonth = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select("TO_CHAR(payment.createdAt, 'YYYY-MM')", 'month')
      .addSelect('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('payment.createdAt >= :start', {
        start: new Date(now.getFullYear() - 1, now.getMonth(), 1),
      })
      .groupBy("TO_CHAR(payment.createdAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(payment.createdAt, 'YYYY-MM')", 'ASC')
      .getRawMany();

    // Top courses
    const topCourses = await this.coursesRepository.find({
      order: { enrollments: 'DESC' },
      take: 5,
      relations: ['instructor'],
    });

    return {
      revenue: {
        total: parseFloat(totalRevenueResult?.total || '0'),
        monthly: parseFloat(monthlyRevenueResult?.total || '0'),
        yearly: parseFloat(yearlyRevenueResult?.total || '0'),
        byMethod: revenueByMethod,
        byMonth: revenueByMonth,
      },
      counts: {
        users: totalUsers,
        activeSubscriptions,
        courses: totalCourses,
        payments: totalPayments,
      },
      topCourses: topCourses.map((course) => ({
        id: course.id,
        title: course.title,
        enrollments: course.enrollments,
        views: course.views,
        instructor: course.instructor
          ? `${course.instructor.firstName} ${course.instructor.lastName}`
          : null,
      })),
    };
  }

  async getRevenueReport(startDate: Date, endDate: Date) {
    const payments = await this.paymentsRepository.find({
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: Between(startDate, endDate),
      },
      relations: ['user', 'subscription'],
      order: { createdAt: 'DESC' },
    });

    const total = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    return {
      period: { startDate, endDate },
      total,
      count: payments.length,
      payments: payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        createdAt: payment.createdAt,
        user: payment.user
          ? `${payment.user.firstName} ${payment.user.lastName}`
          : null,
      })),
    };
  }
}
