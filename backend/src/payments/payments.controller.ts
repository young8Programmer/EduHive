import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate a payment' })
  initiate(@Request() req, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.initiatePayment(
      req.user.userId,
      createPaymentDto.plan,
      createPaymentDto.method,
    );
  }

  @Post('webhook/click')
  @Public()
  @ApiOperation({ summary: 'Click payment webhook' })
  async clickWebhook(@Body() data: any, @Headers() headers: any) {
    await this.paymentsService.handleWebhook('click' as any, data);
    return { success: true };
  }

  @Post('webhook/payme')
  @Public()
  @ApiOperation({ summary: 'Payme payment webhook' })
  async paymeWebhook(@Body() data: any, @Headers() headers: any) {
    await this.paymentsService.handleWebhook('payme' as any, data);
    return { success: true };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my payments' })
  findMyPayments(@Request() req) {
    return this.paymentsService.findByUserId(req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payments (Admin only)' })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment statistics (Admin only)' })
  getStats() {
    return this.paymentsService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by ID' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
