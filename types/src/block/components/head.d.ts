/// <reference types="react" />
import { BaseComponent } from "../base/component";
import { TextSpan } from "./textspan";
export declare class Head extends TextSpan {
    level: 'h1' | 'h2' | 'h3';
}
export declare class HeadView extends BaseComponent<Head> {
    render(): JSX.Element;
}
