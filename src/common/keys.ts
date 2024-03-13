
export enum KeyboardCode {
    ArrowDown = 'ArrowDown',
    ArrowLeft = 'ArrowLeft',
    ArrowRight = 'ArrowRight',
    ArrowUp = 'ArrowUp',
    Backspace = 'Backspace',
    Space = ' ',
    Delete = 'Delete',
    Enter = 'Enter',
    Tab = 'Tab',
    A = 'A',
    B = 'B',
    D = 'D',
    E = 'E',
    J = 'J',
    L = 'L',
    I = 'I',
    U = 'U',
    K = 'K',
    H = 'H',
    Z = 'Z',
    Y = 'Y',
    S = 'S',
    P = 'P',
    Esc = 'Escape',
    K0 = '0',
    K1 = '1',
    K2 = '2',
    K3 = '3',
    K4 = '4',
    K5 = '5',
    K6 = '6',
    K7 = '7',
    K8 = '8',
    K9 = '9',

    X = 'X',
    C = 'C',
    "\\" = '\\',
    "\/" = "/",

    /**
     * keyboardEvent 中的code
     */
    Slash = 'Slash',
    Backslash = 'Backslash',
    R = 'R'
}
export class KeyboardPlate {
    private altKey: boolean = false;
    private ctrlKey: boolean = false;
    private metaKey: boolean = false;
    private shiftKey: boolean = false;
    keys: KeyboardCode[] = [];
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
        else if (!this.keys.exists(event.code as KeyboardCode))
            this.keys.push(event.code as KeyboardCode)
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
        return this.listeners.some(s => s.isBlocked !== false && s.predict(this) && typeof s.keydown == 'function')
    }
    keyup(event: KeyboardEvent) {
        this.isKeyUped = true;
        delete this.lastKeydownDate;
        this.metaKey = event.metaKey;
        this.altKey = event.altKey;
        this.shiftKey = event.shiftKey;
        this.ctrlKey = event.ctrlKey;
        this.keys = [];
        //lodash.remove(this.keys, g => g == event.key || g == event.code);
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
    isMix(shift?: boolean, ctrl?: boolean, alt?: boolean, meta?: boolean, code?: KeyboardCode) {
        console.log(this.shiftKey, this.ctrlKey, this.altKey, this.metaKey, code, shift, ctrl, alt, meta)
        if (shift == true && this.shiftKey == false) return;
        if (ctrl == true && this.ctrlKey == false) return;
        if (alt == true && this.altKey == false) return;
        if (meta == true && this.metaKey == false) return;
        if (typeof code != 'undefined') { if (this.is(code)) return true; }
        else return true;
    }
    private listeners: {
        predict: (kbp: KeyboardPlate) => boolean,
        keydown: (event: KeyboardEvent, kbp: KeyboardPlate) => void,
        keyup?: (event: KeyboardEvent, kbp: KeyboardPlate) => void,
        key?: any,
        isBlocked?: boolean
    }[] = [];
    listener(
        predict: (kbp: KeyboardPlate) => boolean,
        keydown: (event: KeyboardEvent, kbp: KeyboardPlate) => void,
        keyup?: (event: KeyboardEvent, kbp: KeyboardPlate) => void, key?: any,
        isBlocked?: boolean) {
        this.listeners.push({ predict, keydown: keydown, keyup, key, isBlocked });
    }
    off(key: any) {
        this.listeners.removeAll(g => g.key === key);
    }
}

