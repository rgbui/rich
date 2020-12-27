
import { BlockType } from "../block/block.type";
import { VcRowText, VcText } from "./text/text.express";
export interface VcProp {
    name: string
    default?: any
}
export interface VcExpress {
    type: BlockType,
    propNames: string[];
    modePropNames: string[],
    props?: VcProp[],
    modes?: VcProp[],
    blocks?: VcExpress[]
}
export let ExpressList: VcExpress[] = [];
ExpressList.push(Object.freeze(VcText));
ExpressList.push(Object.freeze(VcRowText));