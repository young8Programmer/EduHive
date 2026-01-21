import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  create(@Request() req, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(req.user.userId, createSubscriptionDto.plan);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my subscriptions' })
  findMySubscriptions(@Request() req) {
    return this.subscriptionsService.findByUserId(req.user.userId);
  }

  @Get('check-access')
  @ApiOperation({ summary: 'Check if user has active subscription' })
  checkAccess(@Request() req) {
    return this.subscriptionsService.checkUserAccess(req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get subscription statistics (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.subscriptionsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel subscription' })
  cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(id);
  }
}
