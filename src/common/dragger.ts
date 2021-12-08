
import React from "react";
import { CursorName, MouseCursor } from "./cursor";
import { Point } from "./point";
import { dom } from "./dom";
export class Dragger {
    constructor(el: HTMLElement, cursor?: CursorName, dis?: number) {
        this.el = el;
        if (typeof dis == 'number') this.moveMinDistance = dis;
        if (cursor) this.cursor = cursor;
    }
    data: Record<string, any> = {};
    public isDown: boolean;
    public isMove: boolean;
    private el: HTMLElement;
    private moveMinDistance: number = 5;
    private mousedownEvent: MouseEvent;
    private _mousedown: (event: MouseEvent) => void;
    private _mousemove: (event: MouseEvent) => void;
    private _mouseup: (event: MouseEvent) => void;
    private cursor: CursorName;
    mousedown: (event: MouseEvent) => void;
    mousemove: (event: MouseEvent) => void;
    mouseup: (event: MouseEvent) => void;
    moveDown: (event: MouseEvent) => void;
    move: (formEvent: MouseEvent, currentEvent: MouseEvent) => void;
    moveEnd: (formEvent: MouseEvent, currentEvent: MouseEvent) => void;
    noMove: (event: MouseEvent) => void;
    bind() {
        var self = this;
        this.el.addEventListener('mousedown', (this._mousedown = (event) => {
            self.isDown = true;
            self.isMove = false;
            self.mousedownEvent = event;
            if (typeof self.mousedown == 'function') self.mousedown(event);
        }));
        document.addEventListener('mousemove', (this._mousemove = (event) => {
            if (self.isDown == true) {
                window.getSelection ? window.getSelection().removeAllRanges() : (document as any).selection.empty();
                if (typeof self.mousemove == 'function') self.mousemove(event);
                if (self.isMove) {
                    if (typeof self.move == 'function') self.move(self.mousedownEvent, event);
                }
                if (!self.isMove && Point.from(event).remoteBy(Point.from(self.mousedownEvent), self.moveMinDistance)) {
                    self.isMove = true;
                    if (this.cursor)
                        MouseCursor.show(this.cursor);
                    if (typeof self.moveDown == 'function') self.moveDown(event);
                }
            }
        }));
        document.addEventListener('mouseup', (this._mouseup = (event) => {
            if (self.isDown == true) {
                if (this.cursor)
                    MouseCursor.hide();
                if (self.isMove == true) {
                    if (typeof self.moveEnd == 'function') self.moveEnd(self.mousedownEvent, event);
                }
                else {
                    if (typeof self.noMove == 'function') self.noMove(event);
                }
                if (typeof self.mouseup == 'function') self.mouseup(event);
                self.data = {};
                delete self.isMove;
                delete self.isDown;
            }
        }))
    }
    off() {
        this.el.removeEventListener('mousedown', this._mousedown);
        document.removeEventListener('mousemove', this._mousemove);
        document.removeEventListener('mouseup', this._mouseup);
    }
}

export function MouseDragger<T = Record<string, any>>(options: {
    event: MouseEvent | React.MouseEvent,
    dis?: number,
    cursor?: CursorName,
    /**
     * 是否跨区域拖动
     */
    isCross?: boolean,
    moveStart?: (event: MouseEvent | React.MouseEvent, data: T, crossData?: { type: string, data: any }) => void,
    move?: (event: MouseEvent, data: T) => void,
    moving?: (event: MouseEvent, data: T, isEnd?: boolean) => void,
    moveEnd?: (event: MouseEvent, isMove: boolean, data: T) => void
}) {
    if (typeof options.dis == 'undefined') options.dis = 5;
    var data: T = {} as any;
    var crossData: { type: string, data: any } = { type: 'none', data: null };
    var move: (event: MouseEvent) => void;
    var up: (event: MouseEvent) => void;
    var scope = {
        isDown: true,
        isMove: false,
        event: options.event
    };
    var crossPanels: HTMLElement[] = [];
    move = (event: MouseEvent) => {
        if (scope.isDown == true) {
            window.getSelection ? window.getSelection().removeAllRanges() : (document as any).selection.empty();
            if (scope.isMove == true) {
                if (options.cursor) MouseCursor.show(options.cursor);
                try {
                    if (typeof options.move == 'function') options.move(event, data)
                    if (typeof options.moving == 'function') options.moving(event, data, false);
                }
                catch (ex) {
                    console.error(ex);
                }
                if (options.isCross) {
                    var cp = dom(event.target as HTMLElement).closest(x => typeof (x as HTMLElement).shy_drop_move == 'function') as HTMLElement;
                    if (cp) {
                        if (!crossPanels.some(s => s === cp)) crossPanels.push(cp);
                        cp.shy_drop_move(crossData.type, crossData.data);
                    }
                }
            }
            else {
                if (Point.from(options.event).remoteBy(Point.from(event), options.dis)) {
                    try {
                        if (typeof options.moveStart == 'function') options.moveStart(scope.event, data, crossData); scope.isMove = true;
                    }
                    catch (ex) {
                        console.error(ex);
                        scope.isMove = false;
                        scope.isDown = false;
                    }
                }
            }
        }
    }
    up = (event: MouseEvent) => {
        if (scope.isDown == true) {
            if (options.cursor) MouseCursor.hide();
            try {
                if (scope.isMove && typeof options.moving == 'function') options.moving(event, data, true);
                if (typeof options.moveEnd == 'function') options.moveEnd(event, scope.isMove, data)
            }
            catch (ex) {
                console.error(ex);
            }
            /**
             * 确保即使出错了，也能正常的释放
             */
            finally {
                scope.isMove = false;
                scope.isDown = false;
                if (options.isCross) {
                    try {
                        var cp = dom(event.target as HTMLElement).closest(x => typeof (x as HTMLElement).shy_drop_move == 'function') as HTMLElement;
                        if (cp) {
                            cp.shy_drop_over(crossData.type, crossData.data);
                        }
                        if (crossPanels.length > 0) {
                            for (let i = 0; i < crossPanels.length; i++) {
                                crossPanels[i].shy_end()
                            }
                        }
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                }
            }
        }
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up)
    }
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up)
}