
/**
 * 同步加载
 * 多个请求过来，请求单个资源，只会加载一次
 * 避免多次请求
 */
export class SyncLoad<T>{
    private cs: {
        obj: T,
        isCreated: boolean,
        create: (callback: (obj: T) => void) => void,
        events: { callback: (obj: T) => void }[]
    } = { obj: null, isCreated: false, create: null, events: [] };
    create(create: (callback: (obj: T) => void) => void): Promise<T> {
        var self = this;
        if (this.cs.obj) return this.cs.obj as any;
        else {
            return new Promise((resolve, reject) => {
                self.cs.events.push({
                    callback: (c) => {
                        resolve(c);
                    }
                });
                if (this.cs.isCreated == false) {
                    this.cs.isCreated = true;
                    create(function (c) {
                        self.cs.obj = c;
                        self.cs.events.forEach(ev => {
                            ev.callback(c);
                        });
                        self.cs.events = [];
                    })
                }
            })
        }
    }
    get obj() {
        return this.cs.obj;
    }
}

