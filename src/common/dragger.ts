import { Events } from "../util/events";
import { Point } from "./point";


export class Dragger {
    constructor(el: HTMLElement, dis?: number) {
        this.el = el;
        if (typeof dis == 'number') this.moveMinDistance = dis;
    }
    data: Record<string, any> = {};
    private el: HTMLElement;
    private isDown: boolean;
    private isMove: boolean;
    private moveMinDistance: number = 5;
    private mousedownEvent: MouseEvent;
    private _mousedown: (event: MouseEvent) => void;
    private _mousemove: (event: MouseEvent) => void;
    private _mouseup: (event: MouseEvent) => void;
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
            console.log(self);
            if (typeof self.mousedown == 'function') self.mousedown(event);
        }));
        document.addEventListener('mousemove', (this._mousemove = (event) => {
            if (self.isDown == true) {
                if (typeof self.mousemove == 'function') self.mousemove(event);
                if (self.isMove) {
                    if (typeof self.move == 'function') self.move(self.mousedownEvent, event);
                }
                if (!self.isMove && Point.from(event).remoteBy(Point.from(self.mousedownEvent), self.moveMinDistance)) {
                    //console.log('xxx');
                    self.isMove = true;
                    if (typeof self.moveDown == 'function') self.moveDown(event);
                }
            }
        }));
        document.addEventListener('mouseup', (this._mouseup = (event) => {
            if (self.isDown == true) {
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