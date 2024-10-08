import lodash from "lodash";
import { util } from "../../util/util";


/***
 * 暂时弃用，这个会导致很多问题
 * 
 * 排队执行
 * 将一系列的异步操作排队执行，每次只执行一个，执行完毕后执行下一个
 */

export class QueueHandle {
    acts: { id: string, notify: (data, err?) => void, action: () => Promise<any> }[] = [];
    async create(action: () => Promise<any>, timeOut?: number) {
        return new Promise((resolve, reject) => {
            var id = util.guid();
            var data = {
                id,
                action,
                notify: (result, err) => {
                    if (err) reject(err)
                    else resolve(result);
                },
                timeOut: setTimeout(() => {
                    lodash.remove(this.acts, g => g.id == id);
                    reject('over Queue Handle time');
                    this.tryExcute();
                }, 10000 || timeOut)
            }
            this.acts.push(data);
            this.notifyExcute();
        })
    }
    private isExcuting: boolean = false;
    private notifyExcute() {
        if (this.isExcuting) return;
        this.tryExcute();
    }
    private tryExcute() {
        var g = this.acts.shift();
        if (g) {
            if (g.action) {
                this.isExcuting = true;
                g.action().then(d => {
                    g.notify(d);
                }).catch(err => {
                    g.notify(undefined, err);
                }).finally(() => {
                    this.tryExcute();
                })
            }
        }
        else {
            this.isExcuting = false;
        }
    }
}