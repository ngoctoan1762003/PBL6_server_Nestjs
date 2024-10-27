/* eslint-disable prettier/prettier */
export class CreatePostDto {
    readonly user_id: string;
    readonly content: string;
    readonly group_id?: string;
    readonly tag?: string[];
    status?: string;
    photo?: string[];
}
