import { IconArguments } from "../../extensions/icon/declare";


export type User = {
    id: string,
    inc?: number,
    name?: string,
    avatar?: IconArguments,
    cover?: IconArguments,
    email?: string,
    phone?: string
}