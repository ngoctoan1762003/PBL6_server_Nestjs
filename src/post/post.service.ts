import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserPostShare } from 'src/user_post_share/user_post_share.interface';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel('UserPostShare') private readonly userPostShareModel: Model<UserPostShare>,
    ) { }

    async createPost(createPostDto: CreatePostDto): Promise<Post> {
        const newPost = new this.postModel(createPostDto);
        return newPost.save();
    }

    async getAllPosts(): Promise<Post[]> {
        return this.postModel.find().exec();
    }

    async getPostById(postId: string): Promise<Post> {
        const post = await this.postModel.findById(postId).exec();
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post;
    }

    async getAllPostAndShareByUserId(userId: string): Promise<any[]> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid User ID format');
        }

        const userPosts = await this.postModel.find({ user_id: userId }).exec();

        const sharedPostShares = await this.userPostShareModel.find({ user_id: userId }).exec();

        const sharedPosts = await Promise.all(
            sharedPostShares.map(async (share) => {
                const post = await this.postModel.findById(share.post_id).exec();
                if (post) {
                    return { ...post.toObject(), shared_time: share.shared_time, time: share.shared_time };
                }
            }),
        );

        const allPosts = [
            ...userPosts.map((post) => ({ user_id: post.user_id, content: post.content, like_user_id: post.like_user_id, dislike_user_id: post.dislike_user_id, comment_id: post.comment_id, tag: post.tag, group_id: post.group_id, time: post.created_time })),
            ...sharedPosts.map((post) => ({ user_id: post.user_id, content: post.content, like_user_id: post.like_user_id, dislike_user_id: post.dislike_user_id, comment_id: post.comment_id, tag: post.tag, group_id: post.group_id, time: post.shared_time }))
        ];

        allPosts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return allPosts;
    }

    async updatePost(postId: string, updatePostDto: UpdatePostDto): Promise<Post> {
        const updatedPost = await this.postModel.findByIdAndUpdate(postId, updatePostDto, { new: true }).exec();
        if (!updatedPost) {
            throw new NotFoundException('Post not found');
        }
        return updatedPost;
    }

    async deletePost(postId: string): Promise<{ message: string }> {
        const result = await this.postModel.findByIdAndDelete(postId).exec();
        if (!result) {
            throw new NotFoundException('Post not found');
        }
        return { message: 'Post deleted successfully' };
    }

    async likePost(postId: string, userId: string): Promise<Post> {
        const post = await this.postModel.findById(postId).exec();
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        post.dislike_user_id = post.dislike_user_id.filter(
            (id) => id.toString() !== userId
        );

        if (!post.like_user_id.includes(userId as any)) {
            post.like_user_id.push(userId as any);
        }
        else {
            post.like_user_id = post.like_user_id.filter(
                (id) => id.toString() !== userId
            );
        }

        return post.save();
    }

    async dislikePost(postId: string, userId: string): Promise<Post> {
        const post = await this.postModel.findById(postId).exec();
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        post.like_user_id = post.like_user_id.filter(
            (id) => id.toString() !== userId
        );

        if (!post.dislike_user_id.includes(userId as any)) {
            post.dislike_user_id.push(userId as any);
        }
        else {
            post.dislike_user_id = post.dislike_user_id.filter(
                (id) => id.toString() !== userId
            );
        }

        return post.save();
    }
}
