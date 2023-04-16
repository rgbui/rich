import { IconArguments } from "../extensions/icon/declare";

export enum UserStatus {
    offline = 0,
    online = 1,
    busy = 2,
    idle = 3,
    hidden = 4,
}

export type UserBasic = {
    id: string,
    avatar?: IconArguments,
    cover?: IconArguments,
    role: 'user' | 'robot',
    sn: number,
    name: string,
    status: UserStatus,
    online: boolean,
    slogan: string
}