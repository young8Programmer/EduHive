import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Invoice } from './entities/invoice.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { UsersService } from '../users/users.service';
import { ClickService } from './services/click.service';
import { PaymeService } from './services/payme.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    private subscriptionsService: SubscriptionsService,
    private usersService: UsersService,
    private clickService: ClickService,
    private paymeService: PaymeService,
    private dataSource: DataSource,
  ) {}

  async createPayment(
    userId: string,
    amount: number,
    method: PaymentMethod,
    subscriptionId?: string,
  ): Promise<Payment> {
    const user = await this.usersService.findOne(userId);

    const transactionId = uuidv4();

    const payment = this.paymentsRepository.create({
      userId,
      subscriptionId,
      method,
      amount,
      status: PaymentStatus.PENDING,
      transactionId,
      description: `Subscription payment - ${method}`,
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Generate invoice
    const invoice = this.invoicesRepository.create({
      paymentId: savedPayment.id,
      invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount: savedPayment.amount,
      tax: 0,
      total: savedPayment.amount,
    });

    await this.invoicesRepository.save(invoice);

    return savedPayment;
  }

  async initiatePayment(
    userId: string,
    plan: string,
    method: PaymentMethod,
  ): Promise<any> {
    const amount = plan === 'monthly' ? 99000 : 990000;

    // Create subscription first (will be activated after payment)
    const subscription = await this.subscriptionsService.create(
      userId,
      plan as any,
    );

    // Create payment
    const payment = await this.createPayment(
      userId,
      amount,
      method,
      subscription.id,
    );

    // Initiate payment with gateway
    if (method === PaymentMethod.CLICK) {
      return this.clickService.createPayment(payment);
    } else if (method === PaymentMethod.PAYME) {
      return this.paymeService.createPayment(payment);
    }

    throw new BadRequestException('Invalid payment method');
  }

  async handleWebhook(
    method: PaymentMethod,
    data: any,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let payment: Payment;
      let isValid: boolean;

      if (method === PaymentMethod.CLICK) {
        isValid = this.clickService.verifyWebhook(data);
        payment = await this.paymentsRepository.findOne({
          where: { transactionId: data.merchant_trans_id },
        });
      } else if (method === PaymentMethod.PAYME) {
        isValid = this.paymeService.verifyWebhook(data);
        payment = await this.paymentsRepository.findOne({
          where: { externalTransactionId: data.params?.id },
        });
      } else {
        throw new BadRequestException('Invalid payment method');
      }

      if (!isValid) {
        throw new BadRequestException('Invalid webhook signature');
      }

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Update payment status
      if (data.status === '2' || data.status === 'paid') {
        payment.status = PaymentStatus.COMPLETED;
        payment.externalTransactionId = data.transaction_id || data.params?.id;

        // Activate subscription
        if (payment.subscriptionId) {
          const subscription = await queryRunner.manager
            .getRepository('Subscription')
            .findOne({ where: { id: payment.subscriptionId } });
          if (subscription) {
            subscription.status = SubscriptionStatus.ACTIVE;
            await queryRunner.manager.save(subscription);
          }
        }
      } else {
        payment.status = PaymentStatus.FAILED;
      }

      await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      relations: ['user', 'subscription', 'invoice'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['user', 'subscription', 'invoice'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { userId },
      relations: ['subscription', 'invoice'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStats() {
    const total = await this.paymentsRepository.count();
    const completed = await this.paymentsRepository.count({
      where: { status: PaymentStatus.COMPLETED },
    });
    const pending = await this.paymentsRepository.count({
      where: { status: PaymentStatus.PENDING },
    });
    const failed = await this.paymentsRepository.count({
      where: { status: PaymentStatus.FAILED },
    });

    const result = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    return {
      total,
      completed,
      pending,
      failed,
      totalRevenue: parseFloat(result?.total || '0'),
    };
  }
}
