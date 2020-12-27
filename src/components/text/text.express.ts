
import { BlockType } from "../../block/block.type";
import { VcExpress } from "../express";
export var VcText: VcExpress = {
    type: BlockType.text,
    propNames: ['text'],
    modePropNames: []
}
export var VcRowText: VcExpress = {
    type: BlockType.rowText,
    propNames: ['text', 'height'],
    modePropNames: []
}