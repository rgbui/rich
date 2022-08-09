import React from "react";
import { Rect } from "../../src/common/vector/point";

export enum InputTextPopSelectorType{
    BlockSelector,
    AtSelector,
    LinkeSelector,
    UrlSelector,
    EmojiSelector
}
export abstract class InputTextPopSelector extends React.Component {
    abstract open(round: Rect, text: string, callback: (...args:any[]) => void,options?:Record<string,any>): Promise<boolean>
    abstract onKeydown(event: KeyboardEvent):boolean|{blockData:Record<string,any>}
    abstract onClose():void;
}