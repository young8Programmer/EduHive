import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment } from '../entities/payment.entity';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class ClickService {
  private merchantId: string;
  private serviceId: string;
  private secretKey: string;
  private merchantUserId: string;
  private apiUrl = 'https://api.click.uz/v2/merchant';

  constructor(private configService: ConfigService) {
    this.merchantId = this.configService.get('CLICK_MERCHANT_ID');
    this.serviceId = this.configService.get('CLICK_SERVICE_ID');
    this.secretKey = this.configService.get('CLICK_SECRET_KEY');
    this.merchantUserId = this.configService.get('CLICK_MERCHANT_USER_ID');
  }

  generateMD5(data: string): string {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  generateSign(amount: number, transactionId: string): string {
    const data = `${this.merchantId}${transactionId}${amount}${this.secretKey}`;
    return this.generateMD5(data);
  }

  async createPayment(payment: Payment): Promise<any> {
    const sign = this.generateSign(
      payment.amount,
      payment.transactionId,
    );

    // In production, you would make actual API call to Click
    // For now, return payment URL structure
    return {
      paymentUrl: `${this.apiUrl}/invoice/create`,
      merchantId: this.merchantId,
      serviceId: this.serviceId,
      transactionId: payment.transactionId,
      amount: payment.amount,
      sign: sign,
      returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
    };
  }

  verifyWebhook(data: any): boolean {
    const {
      merchant_trans_id,
      amount,
      sign_time,
      click_trans_id,
      sign_string,
    } = data;

    const sign = this.generateMD5(
      `${click_trans_id}${merchant_trans_id}${amount}${sign_time}${this.secretKey}`,
    );

    return sign === sign_string;
  }
}
