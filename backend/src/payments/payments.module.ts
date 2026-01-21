import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Invoice } from './entities/invoice.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsersModule } from '../users/users.module';
import { ClickService } from './services/click.service';
import { PaymeService } from './services/payme.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Invoice]),
    SubscriptionsModule,
    UsersModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, ClickService, PaymeService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
