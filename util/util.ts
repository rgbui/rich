
import dayjs from 'dayjs';
import lodash from 'lodash';
import { channel } from '../net/channel';
import { lst } from '../i18n/store';
import axios from 'axios';

export var util = {
    guid() {
        return channel.query('/guid');
    },
    clone<T>(json: T): T {
        return lodash.cloneDeep(json);
    },
    valueIsEqual(a, b) {
        return lodash.isEqual(a, b);
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
    },
    showTime(date: Date) {
        if (!date) return '';
        var now = new Date();
        if (dayjs(now).isSame(dayjs(date), 'day')) {
            var hour = date.getHours();
            if (hour >= 0 && hour < 6) {
                return lst('今天') + " " + dayjs(date).format('HH:mm')
            }
            else if (hour >= 6 && hour < 11) {
                return lst('上午') + " " + dayjs(date).format('HH:mm')
            }
            else if (hour >= 11 && hour < 13) {
                return lst('中午') + " " + dayjs(date).format('HH:mm')
            }
            else if (hour >= 13 && hour < 18) {
                return lst('下午') + " " + dayjs(date).format('HH:mm')
            }
            else if (hour >= 18 && hour <= 23) {
                return lst('晚上') + " " + dayjs(date).format('HH:mm')
            }
        }
        else if (dayjs(now).isSame(dayjs(date).add(1, 'day'), 'day')) {
            return lst('昨天') + " " + dayjs(date).format('HH:mm')
        }
        else if (dayjs(now).isSame(dayjs(date).add(2, 'day'), 'day')) {
            return lst('前天') + " " + dayjs(date).format('HH:mm')
        }
        else {
            return dayjs(date).format('YYYY/MM/DD');
        }
    },
    dateToStart(date: Date) {
        return dayjs(date).startOf('day').toDate();
    },
    dateToEnd(date: Date) {
        return dayjs(date).endOf('day').toDate();
    },
    /**
     * 时间差，还剩多少
     * @param time 
     * @returns 
     */
    timeToString(time: number) {
        if (typeof time != 'number' || isNaN(time)) return '';
        var t = time;
        var ps: string[] = [];
        if (t > 1000 * 60 * 60 * 24) {
            ps.push(Math.floor(t / (1000 * 60 * 60 * 24)) + lst('天'));
            t = t % (1000 * 60 * 60 * 24)
        }
        if (t > 1000 * 60 * 60) {
            ps.push(Math.floor(t / (1000 * 60 * 60)) + lst('时'));
            t = t % (1000 * 60 * 60)
        }
        if (t > 1000 * 60) {
            ps.push(Math.floor(t / (1000 * 60)) + lst('分'));
            t = t % (1000 * 60)
        }
        if (t >= 1000) {
            ps.push(Math.floor(t / 1000) + lst('秒'));
            t = t % 1000
        }
        if (t >= 0 && ps.length == 0) {
            ps.push(t + 'ms');
        }
        return ps.join('')
    },
    byteToString(byte: number) {
        if (byte > 1024 * 1024 * 1024 * 1024 * 1024) {
            return (byte / (1024 * 1024 * 1024 * 1024 * 1024)).toFixed(2) + "PB"
        }
        else if (byte > 1024 * 1024 * 1024 * 1024) {
            return (byte / (1024 * 1024 * 1024 * 1024)).toFixed(2) + "T"
        }
        else if (byte > 1024 * 1024 * 1024) {
            return (byte / (1024 * 1024 * 1024)).toFixed(2) + "G"
        }
        else if (byte > 1024 * 1024) {
            return (byte / (1024 * 1024)).toFixed(2) + "M"
        }
        else if (byte > 1024) {
            return (byte / 1024).toFixed(2) + "KB"
        }
        else if (byte > 0) {
            return (byte).toFixed(2) + "B"
        }
        else return '0KB'
    },
    async getText(url: string) {
        return new Promise((resolve: (d: string) => void, reject) => {
            var x = new XMLHttpRequest();
            x.open("GET", url, true);
            x.responseType = 'text';
            x.onload = function (e) {
                resolve(x.responseText)
            }
            x.onerror = function (err) {
                reject(err);
            }
            x.send();
        })
    },
    async getJson(url: string) {
        try {
            var r = await fetch(url);
            return { data: await r.json(), status: r.status }
        }
        catch (err) {
            console.error(err);
        }
    },
    async downloadFile(fileUrl, fileName) {

        /****
         * 这里有部分图片，因浏览器缓存(img src)的问题，
         * img中的src没有对跨域给出处理，
         * 而下载触发非简单请求，在前台就基于跨域性的问题给拦截了，实际后台对跨域是支持的
         * 所以这里加上时间戳，避免浏览器缓存
         */
        if (fileUrl.indexOf('?') > -1) fileUrl += "&____t=" + new Date().getTime();
        else fileUrl += "?____t=" + new Date().getTime();
        var response = await axios({
            url: fileUrl, // 替换为实际的文件下载URL
            method: 'GET',
            responseType: 'blob', // 表示服务器响应的数据类型
        })
        // 创建一个隐藏的a标签用于下载
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName); // 设置下载文件的名称
        document.body.appendChild(link);
        link.click(); // 模拟点击下载
        // 清理并释放URL对象
        window.URL.revokeObjectURL(url);
        link.remove();
    },
    async downloadFileByData(data: string, name: string) {
        //Blob为js的一个对象，表示一个不可变的, 原始数据的类似文件对象，这是创建文件中不可缺少的！
        var urlObject = window.URL;
        var export_blob = new Blob([data]);
        var save_link = document.createElement("a")
        save_link.href = urlObject.createObjectURL(export_blob);
        save_link.download = name;
        save_link.click();

    },
    getListName<T>(list: T[], name: string, predict: (g: T) => string, getName?: (text: string, number: number) => string) {
        var index = 0;
        while (true) {
            var n = typeof getName == 'function' ? getName(name, index) : (name + (index == 0 ? "" : index));
            if (list.some(c => predict(c) == n)) {
                index += 1;
            }
            else return n;
        }
    },
    extendKey(obj: Record<string, any>, path: string) {
        var json: Record<string, any> = {}
        for (let n in obj) {
            json[path + "." + n] = obj[n]
        }
        return json;
    },
    setKey(obj: Record<string, any>, setObj: Record<string, any>) {
        for (let n in setObj) {
            lodash.set(obj, n, setObj[n]);
        }
    },
    getRandom(start: number, end: number) {
        return Math.round(Math.random() * (end - start) + start);
    },
    async readFileText(file: File) {
        var reader = new FileReader();
        return new Promise((resolve: (str: string) => void, reject) => {
            reader.onloadend = function (evt) {
                if (evt.target.readyState == FileReader.DONE) {
                    // callback(evt.target.result);
                    resolve(evt.target.result as string)
                }
            };
            // 包含中文内容用gbk编码
            reader.readAsText(file);
        })
    },
    /**
     * base64加密
     * @param originalString 
     * @returns 
     */
    base64En(originalString) {
        // const originalString = "你好，世界！";
        const encoder = new TextEncoder();
        const utf8Array = encoder.encode(originalString);
        const base64String = btoa(String.fromCharCode.apply(null, utf8Array));
        console.log(base64String); // "5L2g5aW977yM5LiW55WMhQ=="
        return base64String;
    },
    /**
     * base64解密
     * @param base64String 
     * @returns 
     */
    base64De(base64String) {
        const decoder = new TextDecoder();
        const base64Array = new Uint8Array(atob(base64String).split("").map(function (c) {
            return c.charCodeAt(0);
        }));
        const decodedString = decoder.decode(base64Array);
        //console.log(decodedString); // "你好，世界！"
        return decodedString;
    },
    getTextareaShowHtml(text: string) {
        text = text.replace(/\n/g, '<br/>');
        return text;
    },
    getFileMime(ext: string) {
        ext = ext.toLowerCase();
        if (['.gif', '.png', '.webp', '.jpg', '.jpeg', '.bmp', '.svg', '.tga', '.exif', '.fpx', '.ico', '.avif', '.apng'].includes(ext)) return "image"
        else if (['.mp3', '.wma', '.wav', '.midi', '.mp4', '.m4v', '.mkv', '.flv', '.vob', '.3gp', '.avi', '.rm', '.rmvb', '.mpeg', '.mpe', '.mpg', '.dat', '.mov', '.qt', '.asf', '.wmv', '.asx'].includes(ext)) return 'video'
        else if (['.zip', '.rar'].includes(ext)) return 'zip'
        else if (['.doc', '.docx', '.pdf', '.ppt', '.xls', '.xlsx'].includes(ext)) return "doc"
        else return 'unknow';
    },
    covertToArray(d) {
        if (Array.isArray(d)) return d;
        else return !lodash.isUndefined(d) && !lodash.isNull(d) ? [d] : []
    },
    decimalToLetter(decimal) {
        let result = '';
        while (decimal > 0) {
            const remainder = (decimal - 1) % 26;
            result = String.fromCharCode(97 + remainder) + result;
            decimal = Math.floor((decimal - 1) / 26);
        }
        return result;
    },
    convertToRoman(num) {
        var romanNumeral = "";
        var decimalNum = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
        var romanNum = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
        for (var i = 0; i < decimalNum.length; i++) {
            while (decimalNum[i] <= num) {
                romanNumeral += romanNum[i];
                num -= decimalNum[i];
            }
        }
        return romanNumeral;
    },
    flatArrayConvertTree<T>(data: T[], id: string = 'id', parentId: string = 'parentId', childsKey: string = 'childs') {
        var rs: T[] = [];
        data.each(da => {
            if (da[parentId]) {
                var pa = data.find(g => g[id] == da[parentId]);
                if (pa) {
                    if (!Array.isArray(pa[childsKey])) pa[childsKey] = [];
                    pa[childsKey].push(da);
                    rs.push(da);
                }
            }
        })
        return data.findAll(g => !rs.exists(r => r == g));
    },
    firstToUpper(word: string) {
        const firstLetter = word.charAt(0);
        const capitalizedWord = firstLetter.toUpperCase() + word.slice(1);
        return capitalizedWord
    },
    remToPx(rem: string) {
        var r = parseFloat(rem.replace('rem', ''));
        return r * 10
    },
    nf(number: any, def: number) {
        if (lodash.isNull(number) || lodash.isUndefined(number)) return def;
        else if (typeof number == 'number') return number;
        else return def;
    },
    replaceAll(str: string, search: string, replacement: string) {
        return str.split(search).join(replacement);
    },
    showPrice(price: number | string) {
        if (typeof price == 'string') {
            price = parseFloat(price);
        }
        if (isNaN(price)) return '0.00';
        return price.toFixed(2);
    },
    neighborDeWeight<T>(list: T[], predict?: (t: T) => any) {
        var array: T[] = [];
        var c = predict ? predict(list[0]) : list[0];
        array.push(list[0]);
        for (let i = 1; i < list.length; i++) {
            var n = predict ? predict(list[i]) : list[i];
            if (c === n) continue;
            else {
                array.push(list[i]);
                c = n;
            }
        }
        return array;
    }
}