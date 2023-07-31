
// import { langStore } from "./store";
// export class LangProvider<T = number>{
//     constructor(key: string) {
//         this.key = key;
//     }
//     private key: string;
//     get lang() {
//         return langStore.lang
//     }
//     get isCn() {
//         return langStore.isCn;
//     }
//     get(id: T): React.ReactElement {
//         return langStore.get(this.key, id);
//     }
//     getText(id: T): string {
//         return langStore.getText(this.key, id);
//     }
//     private isImported: boolean = false;
//     async import() {
//         if (this.isImported == true) return;
//         if (this._load) { this.isImported = true; await langStore.register(this.key, this._load); }
//     }
//     private _load;
//     register(load: (lang: string) => Promise<Record<string, any>>) {
//         this._load = load;
//     }
// }