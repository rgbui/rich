import React, { ReactElement } from "react";
import { Sp } from ".";
import { LangID } from "./declare";
class LangProvider {
    public isLoaded: boolean = false;
    private lang: string = 'zh';
    /**
     * 切换语言
     * @param lang 
     */
    async switch(lang: string) {
        if (this.lang == lang) return;
        this.lang = lang;
        await this.load();
        this.forceAllUpdate();
    }
    private forceAllUpdate() {
        this.sps.forEach((s) => {
            try {
                s.forceUpdate();
            }
            catch (ex) {
                console.error(ex);
            }
        })
    }
    private count = 0;
    private sps: Map<number, Sp> = new Map();
    get id() {
        return (this.count += 1);
    }
    push(sp: Sp) {
        if (!this.sps.has(sp.id)) {
            this.sps.set(sp.id, sp);
        }
    }
    remove(sp: Sp) {
        this.sps.delete(sp.id);
    }
    get(id: LangID): React.ReactElement {
        if (typeof this.dict[id] != 'undefined') {
            var value = this.dict[id];
            if (typeof value == 'string') return <>{value}</>;
            else return value;
        }
        return <>no declare lang id</>;
    }
    private dict: Record<LangID, React.ReactElement> = {} as any;
    private async load() {
        this.isLoaded = false;
        var data: any = {};
        switch (this.lang) {
            case 'en':
                data = await import('./lang/en');
                break;
            case 'zh':
                data = await import('./lang/zh');
                break;
        }
        if (typeof data.default != 'undefined')
            this.dict = data.default;
        this.isLoaded = true;
    }
    private async init() {
        await this.load();
        this.forceAllUpdate();
    }
    constructor() {
        this.init();
    }
}
export var langProvider = new LangProvider();