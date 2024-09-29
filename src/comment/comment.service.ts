import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './comment.schema';
import { Post } from 'src/post/post.schema';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Post.name) private postModel: Model<Post>,  // Inject the Post model
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

    const savedComment = await newComment.save();

    const updatedPost = await this.postModel.findByIdAndUpdate(
      post_id,
      { $push: { comment_id: savedComment._id } },  // Push the new comment ID
      { new: true }
    ).exec();

    // Check if the post was found and updated
    if (!updatedPost) {
      throw new NotFoundException('Post not found');
    }

    return savedComment;
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
