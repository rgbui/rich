import { FieldType } from "../schema/type"
import { CardView } from "./view";


import "./views/pin"


export type CardPropsType = {
    url: string,
    title: string,
    remark?: string,
    image: any,
    props?: { name: string, text: string, types: FieldType[] }[],
    view?:typeof CardView
}
