import { DataStoreViewFactory } from ".";




export function DataStoreViewCom(url: string) {
    return (target) => {
        target.prototype.url = url;
        DataStoreViewFactory.registerDataStoreView(url, target);
    }
}
