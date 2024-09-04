import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './message.interface';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const newMessage = new this.messageModel({
        ...createMessageDto,
        send_time: new Date(),  
      });
      return newMessage.save();
  }

  async getAllMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return this.messageModel.find({conversation_id: conversationId}).exec();
  }

  async getMessageById(id: string): Promise<Message> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid ID format`);
    }

    const message = await this.messageModel.findById(id).exec();
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async updateMessage(id: string, updateMessageDto: UpdateMessageDto): Promise<Message> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid ID format`);
    }

    const updatedMessage = await this.messageModel.findByIdAndUpdate(
      id,
      updateMessageDto,
      { new: true }
    ).exec();
    if (!updatedMessage) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return updatedMessage;
  }

  async deleteMessage(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid ID format`);
    }

    const result = await this.messageModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return { message: 'Message successfully deleted' };
  }
}
