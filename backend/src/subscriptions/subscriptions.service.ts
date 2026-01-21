import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from './entities/subscription.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    private usersService: UsersService,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, plan: SubscriptionPlan): Promise<Subscription> {
    const user = await this.usersService.findOne(userId);

    // Check if user has active subscription
    const activeSubscription = await this.findActiveByUserId(userId);
    if (activeSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    const startDate = new Date();
    const endDate = new Date();
    
    if (plan === SubscriptionPlan.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const amount = plan === SubscriptionPlan.MONTHLY ? 99000 : 990000; // UZS

    const subscription = this.subscriptionsRepository.create({
      userId,
      plan,
      amount,
      startDate,
      endDate,
      status: SubscriptionStatus.PENDING,
    });

    return this.subscriptionsRepository.save(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByUserId(userId: string): Promise<Subscription | null> {
    const subscriptions = await this.subscriptionsRepository.find({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });

    for (const subscription of subscriptions) {
      if (subscription.isActive()) {
        return subscription;
      }
    }

    return null;
  }

  async checkUserAccess(userId: string): Promise<boolean> {
    const subscription = await this.findActiveByUserId(userId);
    return subscription !== null && subscription.isActive();
  }

  async cancel(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    return this.subscriptionsRepository.save(subscription);
  }

  async expireOldSubscriptions(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const now = new Date();
      await queryRunner.manager
        .createQueryBuilder()
        .update(Subscription)
        .set({ status: SubscriptionStatus.EXPIRED })
        .where('status = :status', { status: SubscriptionStatus.ACTIVE })
        .andWhere('endDate < :now', { now })
        .execute();

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getStats() {
    const total = await this.subscriptionsRepository.count();
    const active = await this.subscriptionsRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });
    const expired = await this.subscriptionsRepository.count({
      where: { status: SubscriptionStatus.EXPIRED },
    });
    const cancelled = await this.subscriptionsRepository.count({
      where: { status: SubscriptionStatus.CANCELLED },
    });

    const monthly = await this.subscriptionsRepository.count({
      where: { plan: SubscriptionPlan.MONTHLY },
    });
    const yearly = await this.subscriptionsRepository.count({
      where: { plan: SubscriptionPlan.YEARLY },
    });

    return {
      total,
      active,
      expired,
      cancelled,
      monthly,
      yearly,
    };
  }
}
