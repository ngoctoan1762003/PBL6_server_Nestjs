import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './comment.schema';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) { }

  // CommentService.createComment example
  async createComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    const { post_id, user_id, content, parent_comment_id } = createCommentDto;

    const validParentCommentId = parent_comment_id ? parent_comment_id : null;

    const newComment = new this.commentModel({
      post_id,
      user_id,
      content,
      parent_comment_id: validParentCommentId,
    });

    return await newComment.save();
  }

  async getAllCommentsByPostId(postId: string): Promise<Comment[]> {
    return this.commentModel.find({ post_id: postId }).exec();
  }

  async getCommentById(id: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id).exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async updateComment(id: string, updateCommentDto: any): Promise<Comment> {
    const updatedComment = await this.commentModel.findByIdAndUpdate(id, updateCommentDto, {
      new: true,
    }).exec();
    if (!updatedComment) {
      throw new NotFoundException('Comment not found');
    }
    return updatedComment;
  }

  async deleteComment(id: string): Promise<{ message: string }> {
    const result = await this.commentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Comment not found');
    }
    return { message: 'Comment successfully deleted' };
  }
}
