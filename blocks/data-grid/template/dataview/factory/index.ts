import { CardView } from "../../card/view";

export class DataStoreViewFactory {
    static DataStoreViews = new Map<string, typeof CardView>();
    static registerDataStoreView(url: string, view: typeof CardView) {
        this.DataStoreViews.set(url, view);
    }
    static getDataStoreView(url: string) {
        return this.DataStoreViews.get(url);
    }
}