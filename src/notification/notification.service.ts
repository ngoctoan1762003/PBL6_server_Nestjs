import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AccountService } from '../account/account.service';
import { Notification } from './notification.interface';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification') private readonly notificationModel: Model<Notification>,
    AccountService
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const newNotification = new this.notificationModel(createNotificationDto);
    return newNotification.save();
  }

  async createNotificationByPost(createNotificationDto: CreateNotificationDto): Promise<string> {
    // Tìm thông tin người nhận (receiver) để lấy danh sách bạn bè của họ
    const receiver = await AccountService.accountModel.findById(createNotificationDto.receiver_id);
  
    // Nếu không tìm thấy người nhận, throw lỗi
    if (!receiver) {
      throw new Error('Receiver not found');
    }
  
    // Giả sử mảng bạn bè của receiver là "friends" (mảng chứa các ObjectId của bạn bè)
    const friendIds = receiver.friend;
  
    // Tạo một mảng các thông báo
    const notifications = friendIds.map((friendId) => {
      const notificationData = {
        ...createNotificationDto,   // Sao chép thông tin từ dto (thông báo gốc)
        receiver_id: friendId      // Thay đổi receiver_id thành ID bạn bè
      };
      return new this.notificationModel(notificationData);
    });
  
    // Lưu tất cả các thông báo vào cơ sở dữ liệu
    const savedNotifications = await this.notificationModel.insertMany(notifications);
  
    // Trả về danh sách các thông báo đã được lưu
    return "OK";
  }
  

  async getAllNotificationsByUserId(userId: string): Promise<Notification[]> {
    return this.notificationModel
        .find({ receiver_id: userId })  // Lọc thông báo theo receiver_id
        .populate('link_user', 'username image') // Populate thông tin name và image từ bảng User
        .exec(); // Thực thi truy vấn
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
