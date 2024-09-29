export interface EnhancedPost {
    user_id: string;
    content: string;
    status: string;
    like_users: any;
    dislike_users: any;
    comment_id: string[];
    tag: string[];
    group_id: string | null;
    time: Date;
    // Add other fields as necessary
}
