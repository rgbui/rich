
import dayjs from 'dayjs';
import lodash from 'lodash';
import { channel } from '../net/channel';

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
                return '今天' + dayjs(date).format('HH:mm')
            }
            else if (hour >= 6 && hour < 11) {
                return '上午' + dayjs(date).format('HH:mm')
            }
            else if (hour >= 11 && hour < 13) {
                return '中午' + dayjs(date).format('HH:mm')
            }
            else if (hour >= 13 && hour < 18) {
                return '下午' + dayjs(date).format('HH:mm')
            }
            else if (hour >= 18 && hour <= 23) {
                return '晚上' + dayjs(date).format('HH:mm')
            }
        }
        else if (dayjs(now).isSame(dayjs(date).add(1, 'day'), 'day')) {
            return '昨天' + dayjs(date).format('HH:mm')
        }
        else if (dayjs(now).isSame(dayjs(date).add(2, 'day'), 'day')) {
            return '前天' + dayjs(date).format('HH:mm')
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
            ps.push(Math.floor(t / (1000 * 60 * 60 * 24)) + '天');
            t = t % (1000 * 60 * 60 * 24)
        }
        if (t > 1000 * 60 * 60) {
            ps.push(Math.floor(t / (1000 * 60 * 60)) + '时');
            t = t % (1000 * 60 * 60)
        }
        if (t > 1000 * 60) {
            ps.push(Math.floor(t / (1000 * 60)) + '分');
            t = t % (1000 * 60)
        }
        if (t >= 1000) {
            ps.push(Math.floor(t / 1000) + '秒');
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


        // return new Promise((resolve: (d: string) => void, reject) => {
        //     var x = new XMLHttpRequest();
        //     x.open("GET", url, true);
        //     x.responseType='json';
        //     x.onload = function (e) {
        //         resolve(x.response)
        //     }
        //     x.onerror = function (err) {
        //         reject(err);
        //     }
        //     x.send();
        // })
    },
    async downloadFile(url, fileName) {
        return new Promise((resolve, reject) => {
            var x = new XMLHttpRequest();
            x.open("GET", url, true);
            x.responseType = 'blob';
            x.onload = function (e) {
                var url = window.URL.createObjectURL(x.response)
                var a = document.createElement('a');
                a.href = url
                a.download = fileName;
                a.click();
                resolve(true)
            }
            x.onerror = function (err) {
                reject(err);
            }
            x.send();
        })
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
    }
}