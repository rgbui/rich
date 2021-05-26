/// <reference types="react" />
import { Block } from '..';
export declare function TextArea(props: {
    html: string;
    placeholder?: string;
}): JSX.Element;
export declare function SolidArea(props: {
    content: JSX.Element | (JSX.Element[]);
}): JSX.Element;
export declare function ChildsArea(props: {
    childs: Block[];
}): JSX.Element;
