/// <reference types="react" />
import { BaseComponent } from "../../base/component";
import { TextSpan } from "../textspan";
export declare class ListText extends TextSpan {
    partName: string;
    get isRow(): boolean;
}
export declare class ListTextView extends BaseComponent<ListText> {
    render(): JSX.Element;
}
