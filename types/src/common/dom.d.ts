import { Anchor } from "../selector/selection/anchor";
declare class Dom {
    el: Node;
    constructor(el: Node);
    style(attr: string, pseudoElt?: string | null): any;
    fontStyle(): {
        fontStyle: any;
        fontVariant: any;
        fontWeight: any;
        fontSize: any;
        lineHeight: any;
        fontFamily: any;
        letterSpacing: any;
        color: any;
    };
    closest(predict: (node: Node) => boolean, ignore?: boolean): Node;
    parents(predict: (node: Node) => boolean, consider?: boolean): void;
    prevFind(predict: (node: Node) => boolean, consider?: boolean): Node;
    nextFind(predict: (node: HTMLElement) => boolean): void;
    findInnerAfter(): Node;
    insertAfter(el: HTMLElement): void;
    insertAnchor(at: number, anchor: Anchor): void;
    removeClass(predict: (cla: string) => boolean): void;
}
export declare var dom: (el: HTMLElement) => Dom;
export {};
