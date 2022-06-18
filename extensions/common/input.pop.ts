import React from "react";
import { Rect } from "../../src/common/vector/point";

export enum InputTextPopSelectorType{
    BlockSelector,
    AtSelector,
    LinkeSelector,
    UrlSelector
}
export abstract class InputTextPopSelector extends React.Component {
    abstract open(round: Rect, text: string, callback: (...args:any[]) => void): Promise<boolean>
    abstract onKeydown(event: KeyboardEvent):boolean|{blockData:Record<string,any>}
}