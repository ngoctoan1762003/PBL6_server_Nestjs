import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './notification.interface';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification') private readonly notificationModel: Model<Notification>,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const newNotification = new this.notificationModel(createNotificationDto);
    return newNotification.save();
  }

  async getAllNotificationsByUserId(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({receiver_id: userId}).exec();
  }

  async getNotificationById(id: string): Promise<Notification> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid ID format`);
    }

    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async updateNotification(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid ID format`);
    }

    const updatedNotification = await this.notificationModel.findByIdAndUpdate(
      id,
      updateNotificationDto,
      { new: true }
    ).exec();
    if (!updatedNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return updatedNotification;
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid ID format`);
    }

    const result = await this.notificationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return { message: 'Notification successfully deleted' };
  }
}
