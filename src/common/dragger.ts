
import React from "react";
import { CursorName, MouseCursor } from "./cursor";
import { Point } from "./vector/point";
import { dom } from "./dom";

export function MouseDragger<T = Record<string, any>>(options: {
    event: MouseEvent | React.MouseEvent,
    isGlobal?: boolean,
    dis?: number,
    cursor?: CursorName,
    /**
     * 是否跨区域拖动
     */
    isCross?: boolean,
    allowSelection?: boolean,
    moveStart?: (event: MouseEvent | React.MouseEvent, data: T, crossData?: { type: string, data: any }) => void,
    move?: (event: MouseEvent, data: T) => void,
    moving?: (event: MouseEvent, data: T, isEnd?: boolean, isMove?: boolean) => void,
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
            if (options.allowSelection != true) window.getSelection ? window.getSelection().removeAllRanges() : (document as any).selection.empty();
            if (scope.isMove == true) {
                if (options.cursor) MouseCursor.show(options.cursor);
                try {
                    if (typeof options.move == 'function') options.move(event, data)
                    if (typeof options.moving == 'function') options.moving(event, data, false, scope.isMove);
                }
                catch (ex) {
                    console.error(ex);
                }
                if (options.isCross) {
                    var cp = dom(event.target as HTMLElement).closest(x => typeof (x as HTMLElement).shy_drop_move == 'function') as HTMLElement;
                    if (cp) {
                        if (!crossPanels.some(s => s === cp)) crossPanels.push(cp);
                        cp.shy_drop_move(crossData.type, crossData.data, event);
                    }
                }
            }
            else {
                if (Point.from(options.event).remoteBy(Point.from(event), options.dis)) {
                    try {
                        if (typeof options.moveStart == 'function') options.moveStart(scope.event, data, crossData);
                        scope.isMove = true;
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
                if (typeof options.moving == 'function') options.moving(event, data, true, scope.isMove);
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
                            cp.shy_drop_over(crossData.type, crossData.data, event);
                        }
                        if (crossPanels.length > 0) {
                            for (let i = 0; i < crossPanels.length; i++) {
                                crossPanels[i].shy_end(event)
                            }
                        }
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                }
            }
        }
        if (options.isGlobal == true) {
            document.removeEventListener('mousemove', move, true);
            document.removeEventListener('mouseup', up, true)
        }
        else {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up)
        }
    }
    if (options.isGlobal == true) {
        document.addEventListener('mouseup', up, true);
        document.addEventListener('mousemove', move, true);
    }
    else {

        document.addEventListener('mouseup', up);
        document.addEventListener('mousemove', move);
    }
}