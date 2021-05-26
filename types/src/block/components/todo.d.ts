/// <reference types="react" />
import { BaseComponent } from "../base/component";
import { TextSpan } from "./textspan";
export declare class ToDo extends TextSpan {
    init(): void;
    checked: boolean;
    onChange(event: Event): void;
    get patternState(): "default" | "checked";
}
export declare class ToDoView extends BaseComponent<ToDo> {
    render(): JSX.Element;
}
