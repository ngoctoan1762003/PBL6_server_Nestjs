import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Post()
  async createNotificationByPost(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotificationByPost(createNotificationDto);
  }

  @Get(':user_id')
  async getAllNotificationsByUserId(
  @Param('user_id') userId: string
  ) {
    return this.notificationService.getAllNotificationsByUserId(userId);
  }


  // @Get(':id')
  // async getNotificationById(@Param('id') id: string) {
  //   return this.notificationService.getNotificationById(id);  
  // }

  @Put(':id')
  async updateNotification(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationService.updateNotification(id, updateNotificationDto);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationService.deleteNotification(id);
  }
}
