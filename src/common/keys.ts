

export enum KeyboardCode {
    ArrowDown = 'ArrowDown',
    ArrowLeft = 'ArrowLeft',
    ArrowRight = 'ArrowRight',
    ArrowUp = 'ArrowUp',
    Backspace = 'Backspace',
    Delete = 'Delete',
    Enter = 'Enter',
    Tab = 'Tab',
    A = 'A',
    B = 'B',
    Z = 'Z',
    Y = 'Y',
    S = 'S'
}
export class KeyboardPlate {
    private altKey: boolean = false;
    private ctrlKey: boolean = false;
    private metaKey: boolean = false;
    private shiftKey: boolean = false;
    private keys: KeyboardCode[] = [];
    private isKeyUped: boolean = true;
    private lastKeydownDate: number;
    /**
     * 建议当前的keydown绑定按键捕获事件
     * @param event 
     */
    keydown(event: KeyboardEvent) {
        this.metaKey = event.metaKey;
        this.altKey = event.altKey;
        this.shiftKey = event.shiftKey;
        this.ctrlKey = event.ctrlKey;
        if (!this.keys.exists(event.key as KeyboardCode))
            this.keys.push(event.key as KeyboardCode);
        else {
            /**
             * 长按keydown，会不断的触发，这里减轻触发的情况
             */
            if (this.isKeyUped == false && typeof this.lastKeydownDate == 'number') {
                var ts = (Date.now() - this.lastKeydownDate);
                if (ts < 1000) return;
            }
            this.isKeyUped = false;
            this.lastKeydownDate = Date.now();
        }
        for (let i = 0; i < this.listeners.length; i++) {
            let listener = this.listeners[i];
            if (listener.predict(this) == true && typeof listener.keydown == 'function') listener.keydown(event, this);
        }
    }
    isPredict() {
        return this.listeners.some(s => s.predict(this) && typeof s.keydown == 'function')
    }
    keyup(event: KeyboardEvent) {
        this.isKeyUped = true;
        delete this.lastKeydownDate;
        this.metaKey = event.metaKey;
        this.altKey = event.altKey;
        this.shiftKey = event.shiftKey;
        this.ctrlKey = event.ctrlKey;
        for (let i = 0; i < this.listeners.length; i++) {
            let listener = this.listeners[i];
            if (listener.predict(this) == true && typeof listener.keyup == 'function') listener.keyup(event, this);
        }
        this.keys.removeAll(event.key as KeyboardCode);
    }
    is(...codes: KeyboardCode[]) {
        return this.keys.exists(g => codes.exists(c => c.toLowerCase() == g.toLowerCase()));
    }
    isContains(...codes: KeyboardCode[]) {
        return this.keys.length >= codes.length && codes.each(c => this.keys.exists(k => k.toLowerCase() == c.toLowerCase()))
    }
    isEqual(...codes: KeyboardCode[]) {
        return this.keys.length == codes.length && codes.each(c => this.keys.exists(k => k.toLowerCase() == c.toLowerCase()))
    }
    only(code: KeyboardCode) {
        if (this.keys.length == 1 && this.keys[0].toLowerCase() === code.toLowerCase()) {
            if (this.altKey == false && this.ctrlKey == false && this.metaKey == false && this.shiftKey == false) return true;
        }
        return false;
    }
    isCtrl(code?: KeyboardCode) {
        if (this.ctrlKey == true) {
            if (typeof code != 'undefined') { if (this.is(code)) return true; }
            else return true;
        }
        return false;
    }
    isShift(code?: KeyboardCode) {
        if (this.shiftKey == true) {
            if (typeof code != 'undefined') { if (this.is(code)) return true; }
            else return true;
        }
        return false;
    }
    isAlt(code?: KeyboardCode) {
        if (this.altKey == true) {
            if (typeof code != 'undefined') { if (this.is(code)) return true; }
            else return true;
        }
        return false;
    }
    isMeta(code?: KeyboardCode) {
        if (this.metaKey == true) {
            if (typeof code != 'undefined') { if (this.is(code)) return true; }
            else return true;
        }
        return false;
    }
    private listeners: {
        predict: (kbp: KeyboardPlate) => boolean,
        keydown: (event: KeyboardEvent, kbp: KeyboardPlate) => void,
        keyup?: (event: KeyboardEvent, kbp: KeyboardPlate) => void,
    }[] = [];
    listener(predict: (kbp: KeyboardPlate) => boolean, keydown: (event: KeyboardEvent, kbp: KeyboardPlate) => void, keyup?: (event: KeyboardEvent, kbp: KeyboardPlate) => void) {
        this.listeners.push({ predict, keydown: keydown, keyup });
    }
}

