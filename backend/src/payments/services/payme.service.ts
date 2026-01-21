import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment } from '../entities/payment.entity';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymeService {
  private merchantId: string;
  private key: string;
  private testKey: string;
  private apiUrl = 'https://checkout.paycom.uz/api';

  constructor(private configService: ConfigService) {
    this.merchantId = this.configService.get('PAYME_MERCHANT_ID');
    this.key = this.configService.get('PAYME_KEY');
    this.testKey = this.configService.get('PAYME_TEST_KEY');
  }

  generateSign(data: any): string {
    const key = process.env.NODE_ENV === 'production' ? this.key : this.testKey;
    const json = JSON.stringify(data);
    return crypto
      .createHmac('sha256', key)
      .update(json)
      .digest('base64');
  }

  async createPayment(payment: Payment): Promise<any> {
    const data = {
      method: 'cards.create',
      params: {
        amount: payment.amount * 100, // Payme uses tiyin (1/100 of sum)
        account: {
          order_id: payment.transactionId,
        },
      },
    };

    const sign = this.generateSign(data);

    // In production, you would make actual API call to Payme
    return {
      paymentUrl: `${this.apiUrl}/cards.create`,
      merchantId: this.merchantId,
      transactionId: payment.transactionId,
      amount: payment.amount,
      sign: sign,
    };
  }

  verifyWebhook(data: any): boolean {
    const { params, method } = data;
    if (!params || !method) {
      return false;
    }

    // Verify signature
    const expectedSign = this.generateSign(data);
    return data.sign === expectedSign;
  }
}
