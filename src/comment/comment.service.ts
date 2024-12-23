import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './comment.schema';
import { PostUser } from 'src/post/post.schema';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(PostUser.name) private postModel: Model<PostUser>,  // Inject the Post model
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

  async getAllCommentsByPostId(postId: string): Promise<any[]> {
    const comments = await this.commentModel.aggregate([
      { $match: { post_id: new Types.ObjectId(postId) } }, // Filter by post_id
      {
        $lookup: {
          from: 'users', // The collection name for users
          localField: 'user_id', // Field in the Comment collection
          foreignField: '_id', // Field in the User collection
          as: 'userDetails', // Name of the output array
        },
      },
      {
        $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true }, // Flatten userDetails array
      },
      {
        $project: {
          _id: 1,
          content: 1,
          post_id: 1,
          parent_comment_id: 1,
          created_time: 1,
          user: {
            _id: '$userDetails._id',
            username: '$userDetails.username',
            image: '$userDetails.image',
          },
        },
      },
    ]);

    // Create a map to store comments by their ID
    const commentMap: Record<string, any> = {};
    comments.forEach(comment => {
      comment.child = []; // Initialize child array
      commentMap[comment._id.toString()] = comment;
    });

    // Create the nested structure
    const topLevelComments = [];
    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parentComment = commentMap[comment.parent_comment_id.toString()];
        if (parentComment) {
          parentComment.child.push(comment); // Add as a child of its parent
        }
      } else {
        topLevelComments.push(comment); // It's a top-level comment
      }
    });

    return topLevelComments;
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
