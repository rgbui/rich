import { langStore } from "./store";

export class LangProvider<T = number>{
    constructor(key: string) {
        this.key = key;
    }
    private key: string;
    get lang() {
        return langStore.lang
    }
    get isCn() {
        return langStore.isCn;
    }
    get(id: T): React.ReactElement {
        return langStore.get(this.key, id);
    }
    getText(id: T): string {
        return langStore.getText(this.key, id);
    }
    async register(load: (lang: string) => Promise<Record<string, any>>) {
        await langStore.register(this.key, load)
    }
}