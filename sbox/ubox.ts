
class DepBox {
    deps: DepProxy[] = [];
    useDeps: UseDep[] = [];
    currentUseDep: UseDep;
    actions: ActionDep[] = [];
    currentAction: ActionDep;
}
class UseDep {
    uses: { dep: DepProxy, obj: Object, key: string }[] = [];
}
class ActionDep {
    updates: { dep: DepProxy, obj: Object, key: string, value: any }[] = [];
}
var depBox = new DepBox();

class Observable<T> {
    constructor(obj: T) {
        return this._createProxy(obj);
    }
    private _createProxy(obj) {
        const dep = new DepProxy();
        dep.source = obj;
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
                    dep.set(target, key, value);
                    const result = Reflect.set(target, key, value, receiver);
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
        pxy.__source = obj;
        pxy.__dep = dep;
        return pxy;
    };
    __source: T;
    __dep: DepProxy<T>;
}

class DepProxy<T = Object> {
    constructor() {
        depBox.deps.push(this);
    }
    source: T;
    proxy: Observable<T>;
    deps: { obj: Object, key: string }[] = [];
    depend(obj, key) {
        if (depBox.currentUseDep) {
            depBox.currentUseDep.uses.push({ dep: this, obj, key });
        }
    }
    set(obj, key, value) {
        if (depBox.currentAction) {
            depBox.currentAction.updates.push({ dep: this, obj, key, value });
        }
    }
}
function observer(fn: () => void) {
    var ud = new UseDep();
    depBox.useDeps.push(ud);
    depBox.currentUseDep = ud;
    fn();
    delete depBox.currentUseDep;
}
function action(fn: () => void) {
    var action = new ActionDep();
    depBox.actions.push(action);
    depBox.currentAction = action;
    fn();
    delete depBox.currentAction;
}
var data = {
    a: 1,
    b: { c: 2, d: 5 },
    g: [1, { a: 3 }]
}
var newData = new Observable(data) as any;
observer(function () {
    console.log(newData.a);
    console.log(depBox);
});
action(function () {
    newData.a = 3;
    console.log(depBox);
})

// console.log(newData, newData.__dep, newData.__source, 'nd');
// console.log(data.g[1]);
// console.log(deps);

function enumerable() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const origin = target[propertyKey];
        // aop
        target[propertyKey] = function (...args: any[]) {
            console.log('before method run')
            let result = origin.apply(this, args)
            console.log('after method run')
            return result;
        }
        return target[propertyKey];
    };
}
class ClassA {
    @enumerable()
    greet() {
        console.log('gre');
    }
}
// console.log((new ClassA()).greet())