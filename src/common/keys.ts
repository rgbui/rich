

export enum KeyboardCode {
    ArrowDown = 'ArrowDown',
    ArrowLeft = 'ArrorLeft',
    ArrowRight = 'ArrowRight',
    ArrowUp = 'ArrowUp',
    Backspace = 'Backspace',
    Delete = 'Delete',
    Enter = 'Enter'
}
export class KeyboardPlate {
    private altKey: boolean = false;
    private ctrlKey: boolean = false;
    private metaKey: boolean = false;
    private shiftKey: boolean = false;
    private keys: KeyboardCode[] = [];
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
    }
    keyup(event: KeyboardEvent) {
        this.metaKey = event.metaKey;
        this.altKey = event.altKey;
        this.shiftKey = event.shiftKey;
        this.ctrlKey = event.ctrlKey;
        this.keys.removeAll(event.key as KeyboardCode);
    }
    is(...codes: KeyboardCode[]) {
        return this.keys.exists(g => codes.exists(g));
    }
    isContains(...codes: KeyboardCode[]) {
        return this.keys.length >= codes.length && codes.each(c => this.keys.exists(c))
    }
    isEqual(...codes: KeyboardCode[]) {
        return this.keys.length == codes.length && codes.each(c => this.keys.exists(c))
    }
    only(code: KeyboardCode) {
        if (this.keys[0] === code && this.keys.length == 1) {
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
}

