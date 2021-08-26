
var deps: Dep[] = [];
class Observable {
    constructor(obj) {
        return this._createProxy(obj);
    }
    _createProxy(obj) {
        const dep = new Dep();
        dep.source = obj;
        deps.push(dep);
        /**
          * 深层处理
          *
        */
        function proxy(obj) {
            return new Proxy(obj, {
                get(target, key, receiver) {
                    dep.depend(target, key);
                    return Reflect.get(target, key, receiver)
                },
                set(target, key, value, receiver) {
                    const result = Reflect.set(target, key, value, receiver);
                    dep.notify(target, key);
                    return result
                }
            });
        };
        function DeepProxy(obj) {
            if (Array.isArray(obj)) {
                obj.map((ob, i) => { obj[i] = DeepProxy(ob); })
                obj = proxy(obj);
                return obj;
            }
            else if (typeof obj == 'object') {
                for (let n in obj) {
                    obj[n] = DeepProxy(obj[n]);
                }
                obj = proxy(obj);
                return obj;
            }
            else return obj;
        }
        var pxy = DeepProxy(obj);
        dep.proxy = pxy;
        return pxy;
    };
}
class Dep {
    source: any;
    proxy: any;
    deps: { obj, key: string }[] = [];
    depend(obj, key) {
        this.deps.push(obj, key);
    }
    events: { obj, key: string }[] = [];
    notify(obj, key) {
        this.events.push({ obj, key });
    }
}
// var data = {
//     a: 1,
//     b: { c: 2, d: 5 },
//     g: [1, { a: 3 }]
// }
// var newData = new Observable(data) as any;
// console.log(data.g[1]);
// console.log(deps);


// class Watcher {
//     obj: Object;
//     key: string;
//     callback: Function;
//     onComputedUpdate: Function;
//     constructor(obj, key, callback, onComputedUpdate) {
//         this.obj = obj;
//         this.key = key;
//         this.callback = callback;
//         this.onComputedUpdate = onComputedUpdate;
//         return this._defineComputed();
//     }
//     _defineComputed() {
//         const self = this
//         const onDepUpdated = () => {
//             const val = self.callback();
//             this.onComputedUpdate(val);
//         }
//         const handler = {
//             get(target, key, receiver) {
//                 // console.log(`我的${key}属性被读取了！`);
//                 // Dep.target = onDepUpdated;
//                 // const val = self.callback();
//                 // Dep.target = null;
//                 return val
//             },
//             set() {
//                 // console.error('计算属性无法被赋值！')
//             }
//         }
//         return new Proxy(this.obj, handler);
//     }
// }



//   Dep.target = null;