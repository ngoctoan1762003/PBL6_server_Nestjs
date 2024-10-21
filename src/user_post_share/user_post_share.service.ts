/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserPostShare } from './user_post_share.interface';
import { CreateUserPostShareDto } from './dto/create_user_post_share.dto';

@Injectable()
export class UserPostShareService {
    constructor(
        @InjectModel('UserPostShare') private readonly userPostShareModel: Model<UserPostShare>,
    ) { }

    async createUserPostShare(createUserPostShareDto: CreateUserPostShareDto): Promise<UserPostShare> {
        const existingShare = await this.userPostShareModel.findOne({
            user_id: createUserPostShareDto.user_id,
            post_id: createUserPostShareDto.post_id,
        }).exec();

        if (existingShare) {
            await this.deleteUserPostShare(existingShare._id.toString());
        }
        else {
            const newUserPostShare = new this.userPostShareModel(createUserPostShareDto);
            return newUserPostShare.save();
        }
    }

    async getAllSharesByUser(userId: string): Promise<UserPostShare[]> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new NotFoundException(`Invalid User ID format`);
        }
        return this.userPostShareModel.find({ user_id: userId }).populate('post_id').exec();
    }

    async getAllSharesByPost(postId: string): Promise<UserPostShare[]> {
        if (!Types.ObjectId.isValid(postId)) {
            throw new NotFoundException(`Invalid Post ID format`);
        }
        return this.userPostShareModel.find({ post_id: postId }).populate('user_id').exec();
    }

    async deleteUserPostShare(id: string): Promise<void> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid ID format`);
        }

        const result = await this.userPostShareModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Share record with ID ${id} not found`);
        }
    }
}
