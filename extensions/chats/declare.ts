export type ChannelTextType = {
    id: string;
    userid: string;
    createDate: Date,
    workspaceId?: string,
    roomId: string;
    seq: number;
    content?: string;
    file?: any;
    files?:any[];
    isEdited?: boolean;
    isDeleted?: boolean;
    replyId?: string;
    reply?: ChannelTextType,
    commentCount?: number,
    likeCount?:number,
    emojis?: {
        emojiId: string;
        code?: string;
        count: number;
    }[]
}