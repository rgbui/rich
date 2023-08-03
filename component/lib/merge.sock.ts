



/**
 * 合并请求
 * 将多次的请求合并为一次请求，间隔5毫秒内的请求合并为一次请求
 * 最大合并请求数为30个
 */

export class MergeSock {
    private wait: number = 5;
    private maxCount: number = 30;
    private time;
    private events: { id: string, args: any[], callback?: (err, data) => void }[] = [];
    private handle: (batchs: { id: string, args?: any[] }[]) => Promise<{ id: string, data: Record<string, any> }[]>
    constructor(handle: MergeSock['handle'], wait?: number, maxCount?: number) {
        this.handle = handle;
        if (typeof wait != 'undefined') this.wait = wait;
        if (typeof maxCount != 'undefined') this.maxCount = maxCount;
    }
    async get<T>(id: string, args?: any[]) {
        return new Promise((resolve: (T) => void, reject) => {
            var es = {
                id,
                args: args,
                callback(err, data) {
                    if (err) reject(err)
                    else resolve(data);
                }
            };
            this.events.push(es);
            if (this.events.length > this.maxCount) {
                if (this.time) {
                    clearTimeout(this.time);
                    this.time = null;
                }
                this.excute();
            }
            else {
                if (!this.time) {
                    this.time = setTimeout(() => {
                        this.excute();
                    }, this.wait);
                }
            }
        })
    }
    private async excute() {
        if (this.time) {
            clearTimeout(this.time);
            this.time = null;
        }
        var events = this.events;
        this.events = [];
        try {
            var rs = await this.handle(events);
            for (let i = 0; i < events.length; i++) {
                events[i].callback(undefined, rs.find(g => g.id == events[i].id)?.data)
            }
        }
        catch (ex) {
            for (let i = 0; i < events.length; i++) {
                events[i].callback(ex, undefined)
            }
        }

    }
}


