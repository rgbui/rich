import { DataStoreView } from "../view";



export class DataStoreViewFactory {
    static DataStoreViews = new Map<string, typeof DataStoreView>();
    static registerDataStoreView(url: string,view: typeof DataStoreView)
    {
        this.DataStoreViews.set(url, view);
    }
    static getDataStoreView(url: string) {
        return this.DataStoreViews.get(url);
    }
}