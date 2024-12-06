import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './message.interface';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { User } from 'src/account/account.schema';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    private accountService: AccountService,  // Inject AccountService

  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<any> {
    // Create a new message
    const newMessage = new this.messageModel({
      ...createMessageDto,
      send_time: new Date(),
    });
  
    // Save the new message
    const savedMessage = await newMessage.save();
  
    // Fetch sender and receiver data
    const senderData = await this.getUsersByIds([savedMessage.sender_id.toString()]);
    const receiverData = await this.getUsersByIds([savedMessage.receiver_id.toString()]);
  
    return {
      ...savedMessage.toObject(), 
      sender_data: {
        username: senderData[0].username,
        image: senderData[0].image,
        _id: senderData[0]._id,
        email: senderData[0].email,
      },
      receiver_data: {
        username: receiverData[0].username,
        image: receiverData[0].image,
        _id: receiverData[0]._id,
        email: receiverData[0].email,
      },
    };
  }
  

  async getAllMessagesByConversationId(conversationId: string): Promise<any[]> {
    // Fetch messages based on conversation ID
    const messages = await this.messageModel.find({ conversation_id: conversationId }).exec();
  
    if (messages.length === 0) {
      return [];
    }
  
    // Map over messages to add sender and receiver data asynchronously
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const senderData = await this.getUsersByIds([message.sender_id.toString()]);
        const receiverData = await this.getUsersByIds([message.receiver_id.toString()]);
  
        return {
          ...message.toObject(), // Convert Mongoose document to plain object
          sender_data: {
            username: senderData[0].username,
            image: senderData[0].image,
            _id: senderData[0]._id,
            email: senderData[0].email,
          }, 
          receiver_data: {
            username: receiverData[0].username,
            image: receiverData[0].image,
            _id: receiverData[0]._id,
            email: receiverData[0].email,
          },
        };
      })
    );
  
    return enrichedMessages;
  }

  async getMessageById(id: string): Promise<Message> {
    if (!Types.ObjectId.isValid(id)) {
      console.log(id)
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

  private async getUsersByIds(userIds: string[]): Promise<User[]> {
    return this.accountService.findByIds(userIds);
  }
}
