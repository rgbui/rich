import { ResourceArguments } from "../icon/declare";

export type WsCommentType= {

    id: string;

    createDate: Date;

    creater: string;

    text: string;

    mentions: string[]

    files: ResourceArguments[];

    parentId: string;

    rootId: string;

    like: { count: number, users: string[], exists?: boolean };

    unlike: { count: number, users: string[], exists?: boolean };
    /**
     * admin,member 系统定义的
     * user 用户定义的
     */

    elementUrl: string;

    workspaceId: string;


    deleted: boolean;

    deletedDate: Date;

    deletedUser: string


    ip: string;


    ipAddress: object


    replyCount: number

    replys?:{
        page: number;
        size: number;
        total: number;
        list: WsCommentType[];
    };
    spread?:boolean;

}
