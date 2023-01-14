import { FieldType } from "../../schema/type"
import { CardView } from "./view";


import "./views/pin";
import "./views/answer.list";
import "./views/question.list";
import "./views/image-text/pin";
import "./views/image-text/text";


export type CardPropsType = {
    url: string,
    group?: string,
    title: string,
    remark?: string,
    image: any,
    props?: { name: string, text: string, types: FieldType[] }[],
    view?: typeof CardView
}
