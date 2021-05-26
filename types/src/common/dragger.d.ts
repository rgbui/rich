export declare class Dragger {
    constructor(el: HTMLElement, dis?: number);
    data: Record<string, any>;
    private el;
    isDown: boolean;
    isMove: boolean;
    private moveMinDistance;
    private mousedownEvent;
    private _mousedown;
    private _mousemove;
    private _mouseup;
    mousedown: (event: MouseEvent) => void;
    mousemove: (event: MouseEvent) => void;
    mouseup: (event: MouseEvent) => void;
    moveDown: (event: MouseEvent) => void;
    move: (formEvent: MouseEvent, currentEvent: MouseEvent) => void;
    moveEnd: (formEvent: MouseEvent, currentEvent: MouseEvent) => void;
    noMove: (event: MouseEvent) => void;
    bind(): void;
    off(): void;
}
