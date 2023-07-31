
// import React from "react";
// import { LangView } from "./view";
// class LangStore {
//     private _lang: string = 'zh';
//     private dict: Record<string, Map<string, React.ReactElement>> = {};
//     private loadLangEvents: Map<string, (lang: string) => Promise<Record<string, any>>> = new Map();
//     async register(key: string, load: (lang: string) => Promise<Record<string, any>>) {
//         this.loadLangEvents.set(key, load);
//         var r = await load(this.lang);
//         if (typeof r == 'object' && r) {
//             if (typeof this.dict[key] == 'undefined') this.dict[key] = new Map();
//             for (let n in r) this.dict[key].set(n, r[n]);
//         }
//         else {
//             console.error('load lang key ' + key + "is fail;")
//         }
//     }
//     private count = 0;
//     private sps: Map<number, LangView> = new Map();
//     get id() {
//         return (this.count += 1);
//     }
//     push(sp: LangView) {
//         if (!this.sps.has(sp.id)) {
//             this.sps.set(sp.id, sp);
//         }
//     }
//     remove(sp: LangView) {
//         this.sps.delete(sp.id);
//     }
//     get lang() {
//         return this._lang;
//     }
//     get isCn() {
//         return this._lang == 'zh';
//     }
//     private async loadLangs() {
//         this.dict = {};
//         var keys = this.loadLangEvents.keys();
//         var values = this.loadLangEvents.values();
//         for (let i = 0; i < this.loadLangEvents.size; i++) {
//             var key = keys[i];
//             var value = values[i];
//             var r = await value(this.lang);
//             if (typeof r == 'object' && r) {
//                 if (typeof this.dict[key] == 'undefined') this.dict[key] = new Map();
//                 for (let n in r) this.dict[key].set(n, r[n]);
//             }
//         }
//     }
//     /**
//    * 切换语言
//    * @param lang 
//    */
//     async onChange(lang: string) {
//         if (this._lang == lang) return;
//         this._lang = lang;
//         await this.loadLangs();
//         this.forceAllUpdate();
//     }
//     private forceAllUpdate() {
//         this.sps.forEach((s) => {
//             try {
//                 s.forceUpdate();
//             }
//             catch (ex) {
//                 console.error(ex);
//             }
//         })
//     }
//     get(key: string, value: any): React.ReactElement {
//         if (typeof value == 'number') value = value.toString();
//         var dic = this.dict[key];
//         if (dic) {
//             var g = dic.get(value);
//             if (g) {
//                 if (typeof g == 'string') return <>{g}</>;
//                 else return g;
//             }
//         }
//         return <>no declare lang id</>;
//     }
//     getText(key: string, value: any): string {
//         if (typeof value == 'number') value = value.toString();
//         var dic = this.dict[key];
//         if (dic) {
//             var g = dic.get(value) as any;
//             if (g) return g;
//         }
//         return 'no declare lang id';
//     }
//     isLoaded(key: string) {
//         if (typeof this.dict[key] != 'undefined') {
//             return this.dict[key] instanceof Map
//         }
//     }
// }

// export var langStore = new LangStore();
