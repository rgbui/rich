/// <reference types="react" />
import { BaseComponent } from "../base/component";
import { TextSpan } from "./textspan";
export declare class ToDo extends TextSpan {
    checked: boolean;
    onChange(event: Event): void;
}
export declare class ToDoView extends BaseComponent<ToDo> {
    render(): JSX.Element;
}
