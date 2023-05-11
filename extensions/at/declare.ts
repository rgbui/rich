import { CollectTableSvg, PageSvg, TopicSvg } from "../../component/svgs";
import { PageLayoutType } from "../../src/page/declare";
import { AtomPermission } from "../../src/page/permission";
import { IconArguments } from "../icon/declare"

export type AtSelectorItem = {
    text: string,
    childs: {
        url: string,
        text: string,
        label?: string,
        args?: Record<string, any>
    }[]
}


