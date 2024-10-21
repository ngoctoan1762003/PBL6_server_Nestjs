import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './post.schema';
import { Comment } from 'src/comment/comment.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserPostShare } from 'src/user_post_share/user_post_share.interface';
import { AccountService } from 'src/account/account.service';
import { User } from 'src/account/account.schema';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        @InjectModel('UserPostShare') private readonly userPostShareModel: Model<UserPostShare>,
        private accountService: AccountService,  // Inject AccountService
    ) { }

    async createPost(createPostDto: CreatePostDto): Promise<Post> {
        createPostDto.status = "Pending"
        const newPost = new this.postModel(createPostDto);
        return newPost.save();
    }

    async getAllPosts(): Promise<any[]> {
        const posts = await this.postModel.find().exec();
        
        const allPosts = await Promise.all(posts.map(async (post) => {
            const likeUserIds = post.like_user_id.map(id => id.toString());
            const dislikeUserIds = post.dislike_user_id.map(id => id.toString());
            
            const userInfo = await this.accountService.getUserById(post.user_id.toString());
            const likeUsers = await this.getUsersByIds(likeUserIds); 
            const dislikeUsers = await this.getUsersByIds(dislikeUserIds); 
    
            return {
                ...post.toObject(),
                userInfo: {
                    username: userInfo.username,
                    email: userInfo.email,
                    role: userInfo.role,
                    status: userInfo.status
                },
                like_user_info: likeUsers.map(user => ({
                    _id: user._id,
                    username: user.username,
                    image: user.image,
                })),
                dislike_user_info: dislikeUsers.map(user => ({
                    _id: user._id,
                    username: user.username,
                    image: user.image,
                })),
            };
        }));
    
        allPosts.sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime());
        return allPosts;
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

        let allPosts = [];

        if (sharedPosts != null){
            allPosts = [
                ...userPosts.map((post) => ({ user_id: post.user_id, content: post.content, like_user_id: post.like_user_id, dislike_user_id: post.dislike_user_id, comment_id: post.comment_id, tag: post.tag, group_id: post.group_id, time: post.created_time })),
                ...sharedPosts.map((post) => ({ user_id: post.user_id, content: post.content, like_user_id: post.like_user_id, dislike_user_id: post.dislike_user_id, comment_id: post.comment_id, tag: post.tag, group_id: post.group_id, time: post.shared_time }))
            ];
        }
        else{
            allPosts = [
                ...userPosts.map((post) => ({ user_id: post.user_id, content: post.content, like_user_id: post.like_user_id, dislike_user_id: post.dislike_user_id, comment_id: post.comment_id, tag: post.tag, group_id: post.group_id, time: post.created_time })),
            ];
        }

        allPosts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return allPosts;
    }

    private async getUsersByIds(userIds: string[]): Promise<User[]> {
        return this.accountService.findByIds(userIds);
    }

    async updatePost(postId: string, updatePostDto: UpdatePostDto): Promise<Post> {
        const updatedPost = await this.postModel.findByIdAndUpdate(postId, updatePostDto, { new: true }).exec();
        if (!updatedPost) {
            throw new NotFoundException('Post not found');
        }
        return updatedPost;
    }

    async approvePost(postId: string): Promise<Post> {
        const updatedPost = await this.postModel.findByIdAndUpdate(postId, { status: "Approved" }, { new: true }).exec();
        if (!updatedPost) {
            throw new NotFoundException('Post not found');
        }
        return updatedPost;
    }

    async deletePost(postId: string): Promise<{ message: string }> {
        // Check if the post exists
        const post = await this.postModel.findById(postId).exec();
        if (!post) {
            throw new NotFoundException('Post not found');
        }
    
        // Delete all comments associated with the post
        await this.commentModel.deleteMany({ post_id: postId }).exec();
    
        // Delete all user_post_shares associated with the post
        await this.userPostShareModel.deleteMany({ post_id: postId }).exec();
    
        const result = await this.postModel.findByIdAndDelete(postId).exec();
    
        if (!result) {
            throw new NotFoundException('Post not found');
        }
    
        return { message: 'Post and related data deleted successfully' };
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
