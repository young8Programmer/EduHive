import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription } from './entities/subscription.entity';
import { UsersModule } from '../users/users.module';
import { SubscriptionExpiryTask } from '../tasks/subscription-expiry.task';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), UsersModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionExpiryTask],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
