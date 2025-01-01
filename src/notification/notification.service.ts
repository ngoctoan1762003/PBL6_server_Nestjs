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

  async createNotificationByPost(createNotificationDto: CreateNotificationDto): Promise<string> {
    // Tìm thông tin người nhận (receiver) để lấy danh sách bạn bè của họ
  
    // Nếu không tìm thấy người nhận, throw lỗi

  
    // Giả sử mảng bạn bè của receiver là "friends" (mảng chứa các ObjectId của bạn bè)

  
    // Tạo một mảng các thông báo
    
  
    // Lưu tất cả các thông báo vào cơ sở dữ liệu
  
    // Trả về danh sách các thông báo đã được lưu
    return "OK";
  }
  

  async getAllNotificationsByUserId(userId: string): Promise<Notification[]> {
    return this.notificationModel
        .find({ receiver_id: userId }) // Lọc thông báo theo receiver_id
        .sort({ created_time: -1 }) // Sắp xếp theo thứ tự giảm dần (mới nhất lên đầu)
        .populate({
            path: 'link_user', // Lấy dữ liệu từ trường link_user
            select: 'username image', // Chỉ lấy các trường cần thiết
        })
        .populate({
            path: 'link_comment', // Từ bảng Post, truy xuất đến bảng User qua user_id
            select: 'username image', // Chỉ lấy username và image từ User
        })
        .exec(); 
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

  async updateIsNew(id: string, isNew: boolean): Promise<Notification> {
    const notification = await this.notificationModel.findById(id).exec();

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    // Cập nhật trường is_new
    notification.is_new = isNew;
    await notification.save();
    
    return notification;
  }

  async markAllAsRead(userId: string, isNew: boolean): Promise<any> {
    try {
      const result = await this.notificationModel.updateMany(
        { receiver_id: userId },
        { $set: { is_new: isNew } },
      );
      return result;
    } catch (error) {
      throw new Error('Error updating notifications: ' + error.message);
    }
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
