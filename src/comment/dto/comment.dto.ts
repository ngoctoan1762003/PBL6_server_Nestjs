export class CreateCommentDto {
    readonly user_id: string;
    readonly post_id: string;
    readonly content: string;
    readonly parent_comment_id?: string;
}

export class UpdateCommentDto {
    readonly content: string;
}