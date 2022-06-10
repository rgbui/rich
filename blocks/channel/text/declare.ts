export type ChannelTextType = {
    id: string;
    userid: string;
    createDate: Date,
    workspaceId?: string,
    roomId: string;
    seq: number;
    content?: string;
    file?: any;
    isEdited?: boolean;
    isDeleted?: boolean;
}