/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PostUser } from './post.schema';
import { Comment } from 'src/comment/comment.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserPostShare } from 'src/user_post_share/user_post_share.interface';
import { AccountService } from 'src/account/account.service';
import { User } from 'src/account/account.schema';
import { ReportPost } from './reportpost.schema';
import { CreateReportPostDto } from './dto/create-report-post.dto';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(PostUser.name) private postModel: Model<PostUser>,
        @InjectModel(ReportPost.name) private reportPostModel: Model<ReportPost>,
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        @InjectModel('UserPostShare') private readonly userPostShareModel: Model<UserPostShare>,
        private accountService: AccountService,  // Inject AccountService
    ) { }

    async createPost(createPostDto: CreatePostDto): Promise<PostUser> {
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
                    status: userInfo.status,
                    image: userInfo.image,
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

    async getPostById(postId: string): Promise<any> {
        const post = await this.postModel.findById(postId).exec();
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
                status: userInfo.status,
                image: userInfo.image
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
                return null; // Return null if post is not found
            }),
        );
    
        // Filter out any null values in sharedPosts
        const validSharedPosts = sharedPosts.filter((post) => post !== null);
    
        const allPosts = [
            ...userPosts.map((post) => ({
                user_id: post.user_id,
                content: post.content,
                like_user_id: post.like_user_id,
                dislike_user_id: post.dislike_user_id,
                comment_id: post.comment_id,
                tag: post.tag,
                group_id: post.group_id,
                created_time: post.created_time,
                _id: post._id
            })),
            ...validSharedPosts.map((post) => ({
                user_id: post.user_id,
                content: post.content,
                like_user_id: post.like_user_id,
                dislike_user_id: post.dislike_user_id,
                comment_id: post.comment_id,
                tag: post.tag,
                group_id: post.group_id,
                created_time: post.shared_time,
                _id: post._id
            }))
        ];
    
        allPosts.sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime());
    
        const result = await Promise.all(allPosts.map(async (post) => {
            const likeUserIds = post.like_user_id.map(id => id.toString());
            const dislikeUserIds = post.dislike_user_id.map(id => id.toString());
    
            const userInfo = await this.accountService.getUserById(post.user_id.toString());
            const likeUsers = await this.getUsersByIds(likeUserIds);
            const dislikeUsers = await this.getUsersByIds(dislikeUserIds);
    
            return {
                ...post, // No need to call post.toObject() here, as `post` is already a plain object
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
    
        return result;
    }
    

    private async getUsersByIds(userIds: string[]): Promise<User[]> {
        return this.accountService.findByIds(userIds);
    }

    async updatePost(postId: string, updatePostDto: UpdatePostDto): Promise<PostUser> {
        const updatedPost = await this.postModel.findByIdAndUpdate(postId, updatePostDto, { new: true }).exec();
        if (!updatedPost) {
            throw new NotFoundException('Post not found');
        }
        return updatedPost;
    }

    async approvePost(postId: string): Promise<PostUser> {
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


    async likePost(postId: string, userId: string): Promise<PostUser> {
        const post = await this.postModel.findById(postId).exec();
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        post.dislike_user_id = post.dislike_user_id.filter(
            (id) => id.toString() !== userId
        );

        post.haha_user_id = post.haha_user_id.filter(
            (id) => id.toString() !== userId
        );

        post.angry_user_id = post.angry_user_id.filter(
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

    async dislikePost(postId: string, userId: string): Promise<PostUser> {
        const post = await this.postModel.findById(postId).exec();
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        post.like_user_id = post.like_user_id.filter(
            (id) => id.toString() !== userId
        );

        post.haha_user_id = post.haha_user_id.filter(
            (id) => id.toString() !== userId
        );

        post.angry_user_id = post.angry_user_id.filter(
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

    async hahaPost(postId: string, userId: string): Promise<PostUser> {
        const post = await this.postModel.findById(postId).exec();
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        post.like_user_id = post.like_user_id.filter(
            (id) => id.toString() !== userId
        );

        post.dislike_user_id = post.dislike_user_id.filter(
            (id) => id.toString() !== userId
        );

        post.angry_user_id = post.angry_user_id.filter(
            (id) => id.toString() !== userId
        );

        if (!post.haha_user_id.includes(userId as any)) {
            post.haha_user_id.push(userId as any);
        }
        else {
            post.haha_user_id = post.haha_user_id.filter(
                (id) => id.toString() !== userId
            );
        }

        return post.save();
    }

    async angryPost(postId: string, userId: string): Promise<PostUser> {
        const post = await this.postModel.findById(postId).exec();
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        post.like_user_id = post.like_user_id.filter(
            (id) => id.toString() !== userId
        );

        post.dislike_user_id = post.dislike_user_id.filter(
            (id) => id.toString() !== userId
        );

        post.haha_user_id = post.haha_user_id.filter(
            (id) => id.toString() !== userId
        );

        if (!post.angry_user_id.includes(userId as any)) {
            post.angry_user_id.push(userId as any);
        }
        else {
            post.angry_user_id = post.angry_user_id.filter(
                (id) => id.toString() !== userId
            );
        }

        return post.save();
    }

    async FindPostByTag(tag: string): Promise<PostUser[]> {
        const posts = await this.postModel.find({ tag: tag }).exec();
        return posts;
    }

    async reportPost(reportPostDto: CreateReportPostDto): Promise<ReportPost> {
        const { post_id, user_id } = reportPostDto;
    
        const existingReport = await this.reportPostModel.findOne({ post_id, user_id }).exec();
        if (existingReport) {
            throw new Error('You have already reported this post.');
        }
    
        const report = new this.reportPostModel(reportPostDto);
        return report.save();
    }    

    async getReportPost(): Promise<{ 
        post_id: string; 
        report_count: number; 
        reports: any[]; 
        post_owner: { user_id: string; username: string; email: string } | null; 
    }[]> {
        const reports = await this.reportPostModel.aggregate([
            // Group reports by post_id
            {
                $group: {
                    _id: "$post_id",
                    report_count: { $sum: 1 },
                    reports: { $push: "$$ROOT" },
                },
            },
            // Lookup post details from the posts collection
            {
                $lookup: {
                    from: "posts", // Collection name for PostUser schema
                    localField: "_id", // _id is the post_id in the group
                    foreignField: "_id", // Match with the _id of the posts collection
                    as: "post_details",
                },
            },
            // Lookup user details for the post owner
            {
                $lookup: {
                    from: "users", // Collection name for users
                    localField: "post_details.user_id",
                    foreignField: "_id",
                    as: "post_owner",
                },
            },
            // Simplify the results
            {
                $project: {
                    post_id: "$_id",
                    report_count: 1,
                    reports: {
                        $map: {
                            input: "$reports",
                            as: "report",
                            in: {
                                _id: "$$report._id",
                                user_id: "$$report.user_id",
                                content: "$$report.content",
                                created_time: "$$report.created_time",
                            },
                        },
                    },
                    post_owner: {
                        $arrayElemAt: [
                            {
                                $map: {
                                    input: "$post_owner",
                                    as: "owner",
                                    in: {
                                        user_id: "$$owner._id",
                                        username: "$$owner.username",
                                        email: "$$owner.email",
                                    },
                                },
                            },
                            0,
                        ],
                    },
                    _id: 0,
                },
            },
        ]).exec();
    
        return reports;
    }
    
    async deleteReportsByPostId(postId: string): Promise<{ message: string; deletedCount: number }> {
        if (!Types.ObjectId.isValid(postId)) {
            throw new Error('Invalid Post ID format');
        }
    
        const result = await this.reportPostModel.deleteMany({ post_id: postId }).exec();
    
        return {
            message: 'Reports deleted successfully',
            deletedCount: result.deletedCount || 0,
        };
    }


    
}
