import lodash from "lodash";
import { UA } from "../../util/ua";

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
    M = 'M',
    Z = 'Z',
    Y = 'Y',
    S = 'S',
    P = 'P',
    F = 'F',
    Q = 'Q',
    N = 'N',
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
    "[" = '[',
    "]" = "]",
    '`' = '`',

    /**
     * keyboardEvent 中的code
     */
    Slash = 'Slash',
    Process = 'Process',
    Backslash = 'Backslash',
    R = 'R'
}

export class KeyboardPlate {
    private altKey: boolean = false;
    private ctrlKey: boolean = false;
    private metaKey: boolean = false;
    private shiftKey: boolean = false;
    keys: KeyboardCode[] = [];
    private isStartLongKeyUped: boolean = true;
    private lastKeydownDate: number;
    /**
     * 这个表示按键是按下的，如果是长按的，会不断的触发keydown事件，这个属性表示是否是按下的
     */
    public isKeydown = false;
    static getKeyString(event: KeyboardEvent) {
        var ek = event.key as KeyboardCode;
        if (typeof event.keyCode == 'number') {
            if (event.keyCode >= 48 && event.keyCode <= 57) {
                ek = (event.keyCode - 48).toString() as KeyboardCode;
            }
            else {
                var ms = {
                    "65": "A",
                    "74": "J",
                    "83": "S",
                    "49": "1",
                    "66": "B",
                    "75": "K",
                    "84": "T",
                    "50": "2",
                    "67": "C",
                    "76": "L",
                    "85": "U",
                    "51": "3",
                    "68": "D",
                    "77": "M",
                    "86": "V",
                    "52": "4",
                    "69": "E",
                    "78": "N",
                    "87": "W",
                    "53": "5",
                    "70": "F",
                    "79": "O",
                    "88": "X",
                    "54": "6",
                    "71": "G",
                    "80": "P",
                    "89": "Y",
                    "55": "7",
                    "72": "H",
                    "81": "Q",
                    "90": "Z",
                    "56": "8",
                    "73": "I",
                    "82": "R",
                    "48": "0",
                    "57": "9",
                    "186": ";",
                    "187": "=",
                    "188": ",",
                    "189": "-",
                    "190": ".",
                    "191": "/",
                    "192": "`",
                    "219": "[",
                    "220": "\\",
                    "221": "]",
                    "222": "'",
                }
                var cc = ms[event.keyCode.toString()] as KeyboardCode;
                if (typeof cc != 'undefined') ek = cc;
            }
        }
        /**
         * 这是windows下面对反斜杠的识别处理
         */
        if (event.key == 'Process') {
            if (event.code == 'Slash') ek = KeyboardCode['/'];
            else if (event.code == 'Backslash') ek = KeyboardCode['\\'];
        }
        return ek;
    }
    /**
     * 建议当前的keydown绑定按键捕获事件
     * @param event 
     */
    keydown(event: KeyboardEvent) {
        this.isKeydown = true;
        this.metaKey = event.metaKey;
        this.altKey = event.altKey;
        this.shiftKey = event.shiftKey;
        this.ctrlKey = event.ctrlKey;
        var ek = KeyboardPlate.getKeyString(event);
        if (!this.keys.exists(ek))
            this.keys.push(ek);
        else if (!this.keys.exists(ek))
            this.keys.push(ek)
        else {
            /**
             * 长按keydown，会不断的触发，这里减轻触发的情况
             */
            if (this.isStartLongKeyUped == false && typeof this.lastKeydownDate == 'number') {
                var ts = (Date.now() - this.lastKeydownDate);
                if (ts < 1000) return;
            }
            this.isStartLongKeyUped = false;
            this.lastKeydownDate = Date.now();
        }
        for (let i = 0; i < this.listeners.length; i++) {
            let listener = this.listeners[i];
            if (listener.predict(this) == true && typeof listener.keydown == 'function') listener.keydown(event, this);
        }
    }
    keyup(event: KeyboardEvent) {
        this.isKeydown = false;
        this.isStartLongKeyUped = true;
        delete this.lastKeydownDate;
        this.metaKey = false;
        this.altKey = false;
        this.shiftKey = false;
        this.ctrlKey = false;
        this.keys = [];
    }
    /**
     * 一般有keydown，必然有keyup，所以这里不需要清理
     * 但当打开一个新的页面，keyup有时候不触发，这里需要手动清理
     * 
     */
    clear() {
        this.isKeydown = false;
        this.isStartLongKeyUped = true;
        delete this.lastKeydownDate;
        this.metaKey = false;
        this.altKey = false;
        this.shiftKey = false;
        this.ctrlKey = false;
        this.keys = [];
    }
    isPredict() {
        return this.listeners.some(s => s.isBlocked !== false && s.predict(this) && typeof s.keydown == 'function')
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
    onlyKeys(...keys: ('ctrl' | 'meta' | 'alt' | 'shift')[]) {
        var ks = [
            'ctrlKey',
            'metaKey',
            'altKey',
            'shiftKey'
        ];
        if (keys.every(k => this[k + 'Key'] == true)) {
            lodash.remove(ks, g => keys.some(k => k == g.replace('Key', '')));
            if (ks.every(k => this[k] == false)) return true;
        }
        return false;
    }
    isShift(code?: KeyboardCode) {
        if (this.onlyKeys('shift') == true) {
            if (typeof code != 'undefined') { if (this.is(code)) return true; }
            else return true;
        }
        return false;
    }
    isAlt(code?: KeyboardCode) {
        if (this.onlyKeys('alt')) {
            if (typeof code != 'undefined') { if (this.is(code)) return true; }
            else return true;
        }
        return false;
    }
    isMetaOrCtrl(code?: KeyboardCode) {
        if (UA.isMacOs && this.onlyKeys('meta') || !UA.isMacOs && this.onlyKeys('ctrl')) {
            if (typeof code != 'undefined') { if (this.is(code)) return true; }
            else return true;
        }
        return false;
    }
    isAltAndShift(code?: KeyboardCode) {
        if (this.onlyKeys('alt', 'shift')) {
            if (typeof code != 'undefined') { if (this.is(code)) return true; }
            else return true;
        }
        return false;
    }
    isMetaOrCtrlAndShift(code?: KeyboardCode) {
        if (UA.isMacOs && this.onlyKeys('meta', 'shift') || !UA.isMacOs && this.onlyKeys('ctrl', 'shift')) {
            if (typeof code != 'undefined') { if (this.is(code)) return true; }
            else return true;
        }
        return false;
    }
    isMetaOrCtrlAndAlt(code?: KeyboardCode) {
        if (UA.isMacOs && this.onlyKeys('meta', 'alt') || !UA.isMacOs && this.onlyKeys('ctrl', 'alt')) {
            if (typeof code != 'undefined') { if (this.is(code)) return true; }
            else return true;
        }
        return false;
    }
    isMix(shift?: boolean, ctrl?: boolean, alt?: boolean, meta?: boolean, code?: KeyboardCode) {
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
        this.listeners.push({ predict, keydown: keydown, keyup, key, isBlocked: isBlocked ? true : false });
    }
    off(key: any) {
        this.listeners.removeAll(g => g.key === key);
    }
}

