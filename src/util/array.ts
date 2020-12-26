

interface Array<T> {
    /**数组反转 */
    each(predict: (item: T, i: number, array: T[]) => boolean | void): void;
    eachReverse(predict: (item: T, i: number, array: T[]) => boolean | void): void;
    findLast(predict: T | ((item: T, i: number, array: any[]) => boolean)): T;
    find(predict: T | ((item: T, i: number, array: T[]) => boolean)): T;
    findAll(predict: T | ((item: T, i: number, array: T[]) => boolean)): T[];

    findBefore(pos: T | number | ((item: T, i?: number, array?: T[]) => boolean), predict: T | ((item: T, i?: number, array?: T[]) => boolean), isIncludeSelf?: boolean): T;
    findAllBefore(pos: T | number | ((item: T, i?: number, array?: T[]) => boolean), predict: T | ((item: T, i?: number, array?: T[]) => boolean), isIncludeSelf?: boolean): T[];
    findAfter(pos: T | number | ((item: T, i?: number, array?: T[]) => boolean), predict: T | ((item: T, i?: number, array?: T[]) => boolean), isIncludeSelf?: boolean): T;
    findAllAfter(pos: T | number | ((item: T, i?: number, array?: T[]) => boolean), predict: T | ((item: T, i?: number, array?: T[]) => boolean), isIncludeSelf?: boolean): T[];

    remove(predict: T | ((item: T, i?: number, array?: T[]) => boolean)): void;
    removeLast(predict: T | ((item: T, i?: number, array?: T[]) => boolean)): void;
    delete(predict: T | ((item: T, i?: number, array?: T[]) => boolean)): void;
    removeAt(index: number): void;
    removeAll(predict: T | ((item: T, i?: number, array?: T[]) => boolean)): void;
    deleteAll(predict: T | ((item: T, i?: number, array?: T[]) => boolean)): void;
    exists(predict: T | ((item: T, i: number, array: T[]) => boolean)): boolean;
    notExistsAppend(item: T, predict: any | ((item: T, i?: number, array?: T[]) => boolean)): void;

    trueForAll(predict: T | ((item: T, i?: number, array?: T[]) => boolean)): boolean;
    existsReplace(exists: T | ((item: T, i?: number, array?: T[]) => boolean), item: T): boolean;
    existsReplaceElseAppend(exists: T | ((item: T, i?: number, array?: T[]) => boolean), item: T): boolean;
    first(item?: T): T;
    last(item?: T): T;
    eq(pos: number): T;
    firstOrDefault(): T;
    replace(predict: number | T | ((item: T, i?: number, array?: T[]) => boolean), item: T): void;
    insertAt(at: number, ...item: T[]): void;
    addRange(at: number | T[], arrs?: T[]): void;
    toArray<U>(predict?: (item: T, i?: number, array?: T[]) => U): U[];

    move(item: T | ((item: T, i?: number, thisArray?: T[]) => boolean), at?: T | number | ((item: T, i?: number, thisArray?: T[]) => boolean)): void;

    append(...item: T[]): void;
    prepend(...item: T[]): void;
    copy(json: any): any;
    findLastIndex(predict: (item: T, i?: number, array?: T[]) => boolean): number;
    clear(): void;
    split(fx: (item: T, i?: number, array?: T[]) => boolean): T[][];
    except<U>(s: U[], fx?: (t: T, u: U) => boolean): T[];
    intersect<U>(s: U[], fx?: (source: U, item: U) => boolean): T[];

    limit(s: number, e: number): T[];
    range(s: number, e: number): T[];

    lookup<U>(s: ((t: T) => U)): Map<U, T[]>;


    distinct<U>(a?: (t: T) => U): U[];
    count(a: any): number;
    findCount(a: any): number;
    sum(predict?: ((t: T) => number)): number | undefined;
    max(predict?: ((t: T) => number)): number | undefined;
    min(predict?: (t: T) => number): number | undefined;
    findMax(predict?: ((t: T) => number)): T;
    findMin(predict?: ((t: T) => number)): T;
    average(predict?: ((t: T) => number)): number;
    avg(predict?: ((t: T) => number) | string): number;
    // keyValueArray(key: any, arr: any[]);
    // keyValueJsonCombine(ar: any[])
    // keyValueArrayCombine(arr: any[])
    arrayJsonEach(arrayJsonName: string, fn: (item: T, deep: number, index: number, sort: number, parent: T, thisArray: T[]) => (void | { break?: boolean, continue?: boolean })): void
    arrayJsonFind(arrayJsonName: string,
        fn: (item: T, index?: number, arr?: T[]) => boolean): T;
    arrayJsonMax(arrayJsonName: string, predict: ((t: T) => number) | string): number | undefined;
    arrayJsonMin(arrayJsonName: string, predict: ((t: T) => number) | string): number | undefined;
    arrayJsonFindMax(arrayJsonName: string, predict: ((t: T) => number) | string): T;
    arrayJsonFindMin(arrayJsonName: string, predict: ((t: T) => number) | string): T;
    arrayJsonExists(arrayJsonName: string, predict: (item: T, index?: number, arr?: T[]) => boolean): boolean;
    //arrayJsonFindParentArray(arrayJsonName: any, fn: any)
    arrayJsonFindAll(arrayJsonName: string, fn: (item: T, index?: number, arr?: T[]) => boolean): T[]
    arrayJsonRemove(arrayJsonName: string, fn: T | ((item: T, index?: number, arr?: T[]) => boolean)): void
    arrayJsonRemoveAll(arrayJsonName: string, fn: (item: T, index?: number, arr?: T[]) => boolean): void
    arrayJsonToArray(arrayJsonName: string,
        fn: (item: T, index?: number, arr?: T[]) => any,
        toArrayJsonName?: string): void
    //arrayJsonFindPosition(arrayJsonName: string, fn: (item: T, index?: number, arr?: T[]) => boolean | string)
    // arrayJsonStructClone(arrayJsonName: string, fn: any, defaultDeep: any, defaultIndex: any)
    //arrayJsonParents(arrayJsonName: string, item: any, fn: any)
    arrayJsonClosest(arrayJsonName: string, item: any, fn: any): void
    //arrayJsonAvailableNumber(arrayJsonName: string, fn: any, start: any)


}




Array.prototype.each = function (fn) {
    for (let i = 0; i < this.length; i++) {
        let item = this[i];
        if (fn.apply(this, [item, i, this]) == false) {
            break;
        }
    }
};
Array.prototype.eachReverse = function (fn) {
    var len = this.length;
    for (let i = len - 1; i >= 0; i--) {
        let item = this[i];
        if (fn.apply(this, [item, i, this]) == false) { break; }
    }
}
Array.prototype.find = function (where: any) {

    var r;
    this.each((x, i) => {
        if (typeof where == "function") {
            if (where(x, i, this) == true) {
                r = x;
                return false;
            }
        } else if (x == where) {
            r = x;
            return false;
        }
        return true;
    });
    return r;
}
Array.prototype.findLast = function (where) {
    var arg = arguments;
    var r = null;
    this.eachReverse(function (x, i) {
        if (typeof where == "function") {
            if (where(x, i) == true) {
                r = x;
                return false;
            }
        } else if (x == where) {
            r = x;
            return false;
        }
    });
    return r;
}

Array.prototype.remove = function (where) {
    var index = this.findIndex(where);
    if (index > -1) { this.removeAt(index); }
}
Array.prototype.removeLast = function (where) {
    var index = this.findLastIndex(where);
    if (index > -1) { this.removeAt(index); }
}
Array.prototype.delete = Array.prototype.remove;
Array.prototype.removeAt = function (index) {
    this.splice(index, 1);
    return this;
}

Array.prototype.removeAll = function (where) {
    this.eachReverse((x, i) => {
        if (typeof where == "function") {
            if (where(x, i) == true) {
                this.removeAt(i);
            }
        } else if (x == where) {
            this.removeAt(i);
        }
    });

}

Array.prototype.findAll = function (where) {
    var r = new Array();
    this.each((x, i) => {
        if (typeof where == "function") {
            if (where(x, i) == true) {
                r.push(x);
            }
        } else if (x == where) {
            r.push(x);
        }
    });
    return r;
}
Array.prototype.findBefore = function (pos, predict, isIncludeSelf) {
    var p;
    if (typeof pos == 'function') p = this.findIndex(pos);
    else if (typeof pos == 'number') p = pos;
    else p = this.findIndex(pos);
    if (isIncludeSelf == true) p += 1;
    for (let i = p - 1; i >= 0; i--) {
        if (typeof predict == 'function' && predict(this[i], i, this) == true) { return this[i] }
        else if (predict == this[i]) return this[i]
    }
}
Array.prototype.findAllBefore = function (pos, predict, isIncludeSelf) {
    var p;
    if (typeof pos == 'function') p = this.findIndex(pos);
    else if (typeof pos == 'number') p = pos;
    else p = this.findIndex(pos);
    if (isIncludeSelf == true) p += 1;
    var list = [];
    for (let i = p - 1; i >= 0; i--) {
        if (typeof predict == 'function' && predict(this[i], i, this) == true) { list.push(this[i]); }
        else if (predict == this[i]) list.push(this[i]);
    }
    return list;
}
Array.prototype.findAfter = function (pos, predict, isIncludeSelf) {
    var p;
    if (typeof pos == 'function') p = this.findIndex(pos);
    else if (typeof pos == 'number') p = pos;
    else p = this.findIndex(pos);
    if (isIncludeSelf == true) p -= 1;
    for (let i = p + 1; i < this.length; i++) {
        if (typeof predict == 'function' && predict(this[i], i, this) == true) { return this[i] }
        else if (predict == this[i]) return this[i]
    }
}
Array.prototype.findAllAfter = function (pos, predict, isIncludeSelf) {
    var p;
    if (typeof pos == 'function') p = this.findIndex(pos);
    else if (typeof pos == 'number') p = pos;
    else p = this.findIndex(pos);
    if (isIncludeSelf == true) p -= 1;
    var list = [];
    for (let i = p + 1; i < this.length; i++) {
        if (typeof predict == 'function' && predict(this[i], i, this) == true) { list.push(this[i]) }
        else if (predict == this[i]) list.push(this[i])
    }
    return list;
}


Array.prototype.exists = function (where) {
    return this.findIndex(where) > -1;
}
Array.prototype.notExistsAppend = function (t, where) {
    if (!this.exists(where)) {
        this.push(t);
    }
}
Array.prototype.trueForAll = function (where) {
    var is = true;
    this.each(function (item, index) {
        if (typeof where == 'function') {
            if (where(item, index) != true) {
                is = false;
                return is;
            }
        }
        else if (where === item) {
            is = false;
            return is;
        }
    });
    return is;
}
Array.prototype.existsReplace = function (t, where) {
    var index = this.findIndex(where);
    if (index > -1) {
        this.replace(index, t);
        return true;
    }
    return false;
}
Array.prototype.existsReplaceElseAppend = function (where, t) {
    var index = this.findIndex(where);
    if (index > -1) {
        this.replace(index, t);
        return true;
    }
    else this.append(t);
    return false;
}

Array.prototype.eq = function (index) {
    if (index > -1 && index < this.length) {
        return this[index];
    }
    return null;
}
Array.prototype.first = function (item) {
    if (typeof (item) != 'undefined') {

        this.move(item, 0);
    } else {
        if (this.length > 0) { return this[0]; }
        return null;
    }

}
Array.prototype.firstOrDefault = function () {
    if (this.length == 1) { return this.first(); } else if (this.length <= 0) { return null; }
    return this;
}
Array.prototype.last = function (item) {
    if (typeof item != 'undefined') {
        this.move(item, this.length - 1);
    } else {
        var len = this.length;
        if (len > 0) { return this[len - 1]; }
        return null;
    }
}
Array.prototype.replace = function (match, data) {
    var index: number;
    if (typeof match == 'number') {
        index = match;
    }
    else
        index = this.findIndex(match);
    this.removeAt(index);
    this.insertAt(index, data);
}

Array.prototype.insertAt = function (index, data) {
    if (arguments.length < 2) { return; }
    var arr = new Array();
    arr.push(index);
    arr.push(0);
    for (var i = 1; i < arguments.length; i++) {
        arr.push(arguments[i]);
    }
    this.splice.apply(this, arr as any);
    return this;
}
// Array.prototype.insertArray = function (index, arr) {
//     if (arr == undefined && Array.isArray(index)) {
//         arr = index;
//         index = this.length;
//     }
//     arr = Array.toArray(arr);
//     arr = arr.copy();
//     arr.prepend(index);
//     this.insertAt.apply(this, arr);
//     return this;
// }
Array.prototype.move = function (item, index: number = 0) {

    if (typeof index == 'object') index = this.findIndex(index);
    if (typeof index == 'function') index = this.findIndex(index);
    if (typeof item == 'function') {
        item = this.find(item);
    }
    var currentIndex = this.findIndex(item);
    if (currentIndex > -1 && currentIndex != index) {
        if (index > currentIndex) {
            for (let i = currentIndex; i < index; i++) {
                this[i] = this[i + 1];
            }
            this[index] = item;
        } else if (index < currentIndex) {
            for (let i = currentIndex; i > index; i--) {
                this[i] = this[i - 1];
            }
            this[index] = item;
        }
    } else {
        if (currentIndex < 0)
            this.insertAt(index, item);
    }
}

//对数组每项进行转换
Array.prototype.toArray = function (fn) {
    var arr = new Array();
    this.each(function (item, i, a) {
        if (fn && typeof fn == "function") {
            var r = fn.apply(a, [item, i, a]);
            if (r != undefined) {
                arr.push(r);
            }
        } else {
            arr.push(item);
        }
    });
    return arr;
}


Array.prototype.copy = function () {
    return this.map(x => x);
}
Array.prototype.findIndex = function (where) {
    var r = -1;
    this.each((x, i) => {
        if (typeof where == "function") {
            if (where(x, i, this) == true) {
                r = i;
                return false;
            }
        } else if (x == where) {
            r = i;
            return false;
        }
    });
    return r;
}

Array.prototype.findLastIndex = function (where) {
    var r = -1;
    this.eachReverse((x, i) => {
        if (typeof where == "function") {
            if (where(x, i, this)) {
                r = i;
                return false;
            }
        } else if (x == where) {
            r = i;
            return false;
        }
    });
    return r;
}
Array.prototype.clear = function () {
    this.splice(0, this.length);
    return this;
}
Array.prototype.split = function (fx) {
    var list = [];
    var groups: any[] = [];
    this.each((r, i, arr) => {
        if ((typeof fx == 'function' && fx(r, i, arr) == true) || (typeof fx != 'function' && fx == r)) {
            if (groups.length > 0) list.push(groups);
            groups = [];
        } else { groups.push(r); }
    })
    if (groups.length > 0) list.push(groups);
    return list;
}

Array.prototype.limit = function (index, size) {
    if (size <= 0) { return []; }
    return this.range(index, index + size - 1);
}
Array.prototype.range = function (start, end) {
    var arr = new Array();
    this.each(function (val, i) {
        if (i >= start && i <= end) { arr.push(val); }
    });
    return arr;
}
// Array.prototype.$sort = function (fn) {
//     if (typeof fn == "function") {
//         var ff = function (x, y) {
//             var r = fn(x, y);
//             if (r == true) { return 1; } else if (r == false) { return -1; } else { return 0; }
//         }
//         this.sort(ff);
//     } else {
//         this.sort.apply(this, arguments);
//     }
// }
// Array.prototype.sortDecrease = function (name) {
//     var uf = 'undefined';
//     var ff = function (x, y) {
//         if (typeof x[name] == uf && typeof y[name] == uf) {
//             return 0;
//         } else if (typeof x[name] != uf && typeof y[name] == uf) {
//             return -1;
//         } else if (typeof x[name] != uf && typeof y[name] != uf && x[name] > y[name]) {
//             return -1;
//         }
//         return 1;
//     }
//     this.sort(ff);
// }
// Array.prototype.sortIncrease = function (name) {
//     var uf = 'undefined';
//     var ff = function (x, y) {
//         if (typeof x[name] == uf && typeof y[name] == uf) {
//             return 0;
//         } else if (typeof x[name] != uf && typeof y[name] == uf) {
//             return -1;
//         } else if (typeof x[name] != uf && typeof y[name] != uf && x[name] < y[name]) {
//             return -1;
//         }
//         return 1;
//     }
//     this.sort(ff);
// }
//比较生成交集
Array.prototype.intersect = function (arr, fx) {
    var list = new Array();
    this.each(function (item) {
        if (typeof fx == 'function') {
            if (arr.exists(a => fx(a, item) == true)) {
                list.push(item);
            }
            return;
        }
        if (arr.exists(item)) {
            list.push(item);
        }
    });
    return list;
}
Array.prototype.except = function (arr, fn) {
    var list = new Array();
    if (arr.length == 0) { return arr.toArray(); }
    var self = this;
    self.each(function (item) {
        var is = false;
        arr.each(function (a) {
            if (fn && fn(a, item) == true) {
                is = true;
                return false;
            } else if (item == a) {
                is = true;
                return false;
            }
        });
        if (!is) { list.push(item); }
    });
    return list;
}

//对每列提取一个KEY，每个KEY对应一个arr,{key,arr,key1:arr1}
Array.prototype.lookup = function (key) {
    // var json = {};
    var map = new Map();
    this.each(function (item) {
        var val;
        if (typeof key == "string") {
            val = item[key];
        } else if (typeof key == "function") {
            val = key(item);
        }
        if (typeof map.get(val) == 'undefined') map.set(val, []);
        map.get(val).push(item);
    });
    return map;
}

Array.prototype.distinct = function (key) {
    var arr = new Array();
    this.each(function (item) {
        if (typeof key == typeof undefined) {
            if (!arr.exists(item)) {
                arr.append(item);
            }
        }
        else if (typeof key == 'string') {
            if (!arr.exists(item[key])) {
                arr.append(item[key]);
            }
        }
    });
    return arr;
}
Array.prototype.count = function (where) {
    return this.findAll(where).length;
}
Array.prototype.findCount = Array.prototype.count;


Array.prototype.sum = function (fn) {
    var sum = 0;
    var self = this;
    this.each(function (x) {
        if (typeof fn == "string") {
            if (typeof x[fn] == "number") {
                sum += x[fn];
            }
        } else if (typeof fn == "function") {
            var r = fn.apply(self, [x]);
            if (typeof r == "number") {
                sum += r;
            }
        }
    })
    return sum;
}
Array.prototype.max = function (fn) {
    let max: number | undefined;
    var self = this;
    this.each(function (x) {
        var v;
        if (typeof fn == "string") {
            if (typeof x[fn] == "number") {
                v = x[fn];
            }
        } else if (typeof fn == "function") {
            var r = fn.apply(self, [x]);
            if (typeof r == "number") {
                v = r;
            }
        }
        else if (typeof fn == 'undefined') v = x;
        if (v != undefined) {
            if (typeof max == "undefined") { max = v; }
            if (typeof max == 'number' && v > max) { max = v; }
        }
    })
    return max;
}
Array.prototype.findMax = function (fn) {
    var max = this.max(fn);
    return this.find((z: any) => {
        if (typeof fn == 'string' && z[fn] == max) return true;
        else if (typeof fn == 'function' && fn(z) == max) return true;
        else if (typeof fn == 'undefined' && z == max) return true;
    })
}
Array.prototype.min = function (fn) {
    var max: number | undefined;
    var self = this;
    this.each(function (x) {
        var v;
        if (typeof fn == "string") {
            if (typeof x[fn] == "number") {
                v = x[fn];
            }
        } else if (typeof fn == "function") {
            var r = fn.apply(self, [x]);
            if (typeof r == "number") {
                v = r;
            }
        }
        else if (typeof fn == 'undefined') v = x;
        if (v != undefined) {
            if (max == undefined) { max = v; }
            if (typeof max == 'number' && v < max) { max = v; }
        }
    })
    return max;
}
Array.prototype.findMin = function (fn) {
    var max = this.min(fn);
    return this.find((z: any) => {
        if (typeof fn == 'string' && z[fn] == max) return true;
        else if (typeof fn == 'function' && fn(z) == max) return true;
        else if (typeof fn == 'undefined' && z == max) return true;
    })
}
Array.prototype.average = function (fn) {
    var sum = 0;
    var self = this;
    var i = 0;
    this.each(function (x) {
        if (typeof fn == "string") {
            if (typeof x[fn] == "number") {
                sum += x[fn];
                i += 1;
            }
        } else if (typeof fn == "function") {
            var r = fn.apply(self, [x]);
            if (typeof r == "number") {
                sum += r;
                i += 1;
            }
        }
    })
    if (i == 0) { return 0; }
    return sum / i;
}
Array.prototype.avg = function (fn) {
    var sum = 0;
    var self = this;
    var i = 0;
    this.each(function (x) {
        if (typeof fn == "string") {
            if (typeof x[fn] == "number") {
                sum += x[fn];
                i += 1;
            }
        }
        else if (typeof fn == "function") {
            var r = fn.apply(self, [x]);
            if (typeof r == "number") {
                sum += r;
                i += 1;
            }
        }
    })
    if (i == 0) { return 0; }
    return sum / i;
}

/********
array json 格式
[
{ arrayJsonName:[子对象数组],arrayJsonClosestName:{指向父对象} },
{ arrayJsonName:[ ] }
]
*******/
Array.prototype.arrayJsonEach = function (arrayJsonName, fn) {
    var maxDeep = 0;
    var index = 0;
    var isBreak = false;
    var fc = function (arr: any[], deep: number, parent: any) {
        if (deep > maxDeep) { maxDeep = deep; }
        var sort = 0;
        arr.each(function (a) {
            if (isBreak) { return false; }
            var r = fn(a, deep, index, sort, parent, arr);
            if (r && r.break == true) {
                isBreak = true;
            }
            if (isBreak) { return false; }
            if (r && r.continue == true) {
                return;
            }
            index += 1;
            sort += 1;
            if (a && Array.isArray(a[arrayJsonName]) && a[arrayJsonName].length > 0) {
                fc(a[arrayJsonName], deep + 1, a);
            }
        })
    }
    fc(this, maxDeep, null);
    return { total: index, deep: maxDeep };
}
Array.prototype.arrayJsonFind = function (arrayJsonName, fn) {
    var f: any;
    var fc = function (arr: any[]) {
        arr.each(function (a, index, arr) {
            if (typeof fn == "function" && fn(a, index, arr) == true) {
                f = a;
                return false;
            } else if (fn == a) {
                f = a;
                return false;
            } else if (Array.isArray(a[arrayJsonName])) {
                fc(a[arrayJsonName]);
                if (f) { return false; }
            }
        })
    }
    fc(this);
    return f;
}
Array.prototype.arrayJsonMax = function (arrayJsonName, fn) {
    var max: number | undefined;
    var self = this;
    this.arrayJsonEach(arrayJsonName, function (x) {
        var v;
        if (typeof fn == "string") {
            if (typeof x[fn] == "number") {
                v = x[fn];
            }
        } else if (typeof fn == "function") {
            var r = fn.apply(self, [x]);
            if (typeof r == "number") {
                v = r;
            }
        }
        else if (typeof fn == 'undefined') v = x;
        if (typeof v != 'undefined') {
            if (typeof max == 'undefined') { max = v; }
            if (typeof max == 'number' && v > max) { max = v; }
        }
    })
    return max;
}
Array.prototype.arrayJsonFindMax = function (arrayJsonName, fn) {
    var max: number | undefined;
    var ele;
    var self = this;
    this.arrayJsonEach(arrayJsonName, function (x) {
        var v;
        if (typeof fn == "string") {
            if (typeof x[fn] == "number") {
                v = x[fn];
            }
        } else if (typeof fn == "function") {
            var r = fn.apply(self, [x]);
            if (typeof r == "number") {
                v = r;
            }
        }
        else if (typeof fn == 'undefined') v = x;
        if (typeof v != 'undefined') {
            if (typeof max == 'undefined') { max = v; ele = x; }
            if (typeof max == 'number' && v > max) { max = v; ele = x; }
        }
    })
    return ele;
}
Array.prototype.arrayJsonMin = function (arrayJsonName, fn) {
    var max: number | undefined;
    var self = this;
    this.arrayJsonEach(arrayJsonName, function (x) {
        var v;
        if (typeof fn == "string") {
            if (typeof x[fn] == "number") {
                v = x[fn];
            }
        } else if (typeof fn == "function") {
            var r = fn.apply(self, [x]);
            if (typeof r == "number") {
                v = r;
            }
        }
        else if (typeof fn == 'undefined') v = x;
        if (typeof v != 'undefined') {
            if (typeof max == 'undefined') { max = v; }
            if (typeof max == 'number' && v < max) { max = v; }
        }
    })
    return max;
}
Array.prototype.arrayJsonFindMin = function (arrayJsonName, fn) {
    var max: number | undefined;
    var ele;
    var self = this;
    this.arrayJsonEach(arrayJsonName, function (x) {
        var v;
        if (typeof fn == "string") {
            if (typeof x[fn] == "number") {
                v = x[fn];
            }
        } else if (typeof fn == "function") {
            var r = fn.apply(self, [x]);
            if (typeof r == "number") {
                v = r;
            }
        }
        else if (typeof fn == 'undefined') v = x;
        if (typeof v != 'undefined') {
            if (typeof max == 'undefined') { max = v; ele = x; }
            if (typeof max == 'number' && v < max) { max = v; ele = x; }
        }
    })
    return ele;
}
Array.prototype.arrayJsonExists = function (arrayJsonName, fn) {
    var f = this.arrayJsonFind(arrayJsonName, fn);
    if (f) return true;
    else return false;
}
// Array.prototype.arrayJsonFindParentArray = function (arrayJsonName, fn) {
//     var f;
//     var fc = function (arr) {
//         arr.each(function (a, index, ar) {
//             if (typeof fn == "function" && fn(a, index, ar) == true) {
//                 f = ar;
//                 return false;
//             } else if (fn == a) {
//                 f = ar;
//                 return false;
//             } else if (Array.isArray(a[arrayJsonName])) {
//                 fc(a[arrayJsonName]);
//                 if (f) { return false; }
//             }
//         })
//     }
//     fc(this);
//     return f;
// }
Array.prototype.arrayJsonFindAll = function (arrayJsonName, fn) {
    var arr: any[] = [];
    var fc = function (arrs: any[]) {
        arrs.each(function (a, index, ar) {
            if (typeof fn == "function" && fn(a, index, ar) == true) {
                arr.push(a);
            } else if (fn == a) {
                arr.push(a);
            }
            if (Array.isArray(a[arrayJsonName])) {
                fc(a[arrayJsonName]);
            }
        })
    }
    fc(this);
    return arr;
}
Array.prototype.arrayJsonRemove = function (arrayJsonName, fn) {
    var f = false;
    var fc = function (arr: any[]) {
        arr.each(function (a, index, arr) {
            if (typeof fn == "function" && fn(a, index, arr) == true) {
                arr.remove(a);
                f = true;
                return false;
            } else if (fn == a) {
                arr.remove(a);
                f = true;
                return false;
            } else if (Array.isArray(a[arrayJsonName])) {
                fc(a[arrayJsonName]);
                if (f) { return false; }
            }
        })
    }
    fc(this);
    return this;
}
Array.prototype.arrayJsonRemoveAll = function (arrayJsonName, fn) {
    var fc = function (arr: any[]) {
        arr.eachReverse(function (a, index, arr) {
            if (typeof fn == "function" && fn(a, index, arr) == true) {
                arr.remove(a);
            } else if (fn == a) {
                arr.remove(a);
            } else if (Array.isArray(a[arrayJsonName])) {
                fc(a[arrayJsonName]);
            }
        })
    }
    fc(this);
    return this;
}
Array.prototype.arrayJsonToArray = function (arrayJsonName, fn, toArrayJsonName = '') {
    if (toArrayJsonName == '') {
        toArrayJsonName = arrayJsonName;
    }
    var d = new Array();
    var fc = function (arr: any[], data: any[]) {
        arr.each(function (a, index, arr) {
            var it;
            if (typeof fn == "function") {
                it = fn(a, index, arr);
            }
            if (typeof it != "undefined") {
                data.push(it);
                if (typeof it[toArrayJsonName] == "undefined") {
                    if (Array.isArray(a[arrayJsonName])) {
                        it[toArrayJsonName] = new Array();
                        fc(a[arrayJsonName], it[toArrayJsonName]);
                    }
                }
            }
        })
    }
    fc(this, d);
    return d;
}
// Array.prototype.arrayJsonFindPosition = function (arrayJsonName, fn) {
//     var position: any = {};
//     var sort = 0;
//     var fc = function (array, deep) {
//         array.each(function (a, index, arr) {
//             var r = (typeof fn == "function" && fn(a, index, arr) || fn == a);
//             if (r == true) {
//                 sort += 1;
//                 position = { deep: deep, sort: sort, index: index, item: a };
//                 return false;
//             } else if (r == "ignore") {
//                 return;
//             } else {
//                 sort += 1;
//             }
//             if (a[arrayJsonName] && a[arrayJsonName].length > 0) {
//                 fc(a[arrayJsonName], deep + 1);
//                 if (position.deep != undefined) { return false; }
//             }
//         })
//     }
//     fc(this, 0);
//     return position;
// }
// Array.prototype.arrayJsonStructClone = function (arrayJsonName, fn, defaultDeep, defaultIndex) {
//     var AR = new Array();
//     var maxDeep = defaultDeep == undefined ? 0 : defaultDeep;
//     var index = defaultIndex == undefined ? 0 : defaultIndex;
//     var isBreak = false;
//     var fc = function (arr, deep, parent) {
//         if (deep > maxDeep) { maxDeep = deep; }
//         var sort = 0;
//         arr.each(function (a, index, arr) {
//             var r = (typeof fn == "function" && fn(a, index, arr) || fn == a);
//             if (r) {
//                 index += 1;
//                 sort += 1;
//                 parent.push(r);
//                 if (!Array.isNullOrEmpty(a[arrayJsonName])) {
//                     var as = a[arrayJsonName];
//                     r[arrayJsonName] = new Array();
//                     fc(as, deep + 1, r[arrayJsonName])
//                 }
//             }
//         })
//     }
//     fc(this, maxDeep, AR);
//     return AR;
// }
// Array.prototype.arrayJsonParents = function (arrayJsonName, item, fn) {
//     var arr = [];
//     var it = item;
//     while (true) {
//         var p = this.arrayJsonFind(arrayJsonName, function (x) {
//             var ss = x[arrayJsonName];
//             if (Array.isArray(ss) && ss.exists(it)) {
//                 return true;
//             }
//             return false;
//         });
//         if (!p) break;
//         if (typeof fn == 'function') {
//             if (fn(p) == true) {
//                 arr.push(p);
//                 it = p;
//             } else break;
//         } else if (typeof fn == 'undefined' && p) {
//             arr.push(p);
//             it = p;
//         }
//     }
//     return arr;
// }
Array.prototype.arrayJsonClosest = function (arrayJsonName, item, fn) {
    //判断自身
    if (fn(item)) { return item; }
    //判断最顶层的      
    // 从包含自身的数组到第二级的
    while (true) {
        var p = this.arrayJsonFind(arrayJsonName, function (x) {
            var ss = x[arrayJsonName];
            return Array.isArray(ss) && ss.exists(function (y: any) { return y == item; })
        });
        if (!p) {
            break;
        }
        if (fn(p) == true) {
            return p;
        }
        item = p;
    }
}



