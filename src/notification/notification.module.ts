import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationSchema } from './notification.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }])],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
