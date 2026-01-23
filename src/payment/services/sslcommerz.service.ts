import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SslcommerzService {
  private readonly storeId: string;
  private readonly storePassword: string;
  private readonly isLive: boolean;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.storeId =
      this.configService.get<string>('SSLCOMMERZ_STORE_ID') ??
      (() => {
        throw new Error('SSLCOMMERZ_STORE_ID is not set');
      })();
    this.storePassword =
      this.configService.get<string>('SSLCOMMERZ_STORE_PASSWORD') ??
      (() => {
        throw new Error('SSLCOMMERZ_STORE_PASSWORD is not set');
      })();
    this.isLive =
      this.configService.get<string>('SSLCOMMERZ_IS_LIVE') === 'true';
    this.baseUrl = this.isLive
      ? 'https://securepay.sslcommerz.com'
      : 'https://sandbox.sslcommerz.com';
  }

  async initiatePayment(paymentData: any) {
    const data: Record<string, string> = {
      store_id: this.storeId,
      store_passwd: this.storePassword,
      total_amount: String(paymentData.amount),
      currency: 'BDT',
      tran_id: String(paymentData.transactionId),
      success_url:
        this.configService.get<string>('SSLCOMMERZ_SUCCESS_URL') || '',
      fail_url: this.configService.get<string>('SSLCOMMERZ_FAIL_URL') || '',
      cancel_url: this.configService.get<string>('SSLCOMMERZ_CANCEL_URL') || '',
      ipn_url: this.configService.get<string>('SSLCOMMERZ_IPN_URL') || '',
      shipping_method: 'NO',
      product_name: paymentData.productName || 'Project Investment',
      product_category: 'Investment',
      product_profile: 'general',
      cus_name: paymentData.customerName || '',
      cus_email: paymentData.customerEmail || '',
      cus_add1: paymentData.customerAddress || 'Dhaka',
      cus_city: paymentData.customerCity || 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: paymentData.customerPhone || '01700000000',
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/gwprocess/v4/api.php`,
        new URLSearchParams(data),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(`SSLCommerz Error: ${error.message}`);
    }
  }

  async validatePayment(valId: string) {
    const validationUrl = `${this.baseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${this.storeId}&store_passwd=${this.storePassword}&format=json`;

    try {
      const response = await axios.get(validationUrl);
      return response.data;
    } catch (error) {
      throw new Error(`SSLCommerz Validation Error: ${error.message}`);
    }
  }
}
