import * as short from 'short-uuid';
export var util = {
    guid() {
        return short.generate();
    },
    clone<T>(json: T): T {
        try {
            let copy = (o) => {
                if (Array.isArray(o)) {
                    return o.map(x => copy(x));
                }
                else if (typeof o == 'undefined') {
                    return o;
                }
                else if (o === null) {
                    return 0;
                }
                else if (typeof o == 'object') {
                    var json = {};
                    for (let n in o) {
                        json[n] = copy(o[n])
                    }
                    return json;
                }
                else return o;
            }
            return copy(json);
        }
        catch (e) {
            throw e;
        }
    },
    valueIsEqual(a, b) {
        let equal = (o, n) => {
            if (n == null) {
                if (o != null) return false;
            }
            else if (typeof n == 'undefined') {
                if (o !== undefined) return false;
            }
            else if (Array.isArray(n)) {
                if (!Array.isArray(o)) return false;
                if (o.length != n.length) return false;
                for (let i = 0; i < n.length; i++) {
                    if (!equal(o[i], n[i])) return false;
                }
            }
            else if (n instanceof Date) {
                if (!(o instanceof Date)) return false;
                if (n.getTime() != o.getTime()) return false;
            }
            else if (typeof n == 'object') {
                if (typeof o != 'object') return false;
                if (Object.keys(n).length != Object.keys(o).length) return false;
                for (var x in n) {
                    if (!equal(o[x], n[x])) {
                        return false;
                    }
                }
            }
            else if (o !== n) {
                return false;
            }
            return true;
        }
        return equal(a, b);
    },
    pickJson(obj, keys: string[]) {
        var json: Record<string, any> = {};
        keys.each(key => {
            json[key] = obj[key]
        });
        return json;
    },
    delay(time) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, time);
        })
    }
}