
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
        var now = new Date();
        if (dayjs(now).isSame(date, 'day')) {
            var hour = date.getHours();
            if (hour > 0 && hour < 6) {
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
        else if (dayjs(now).diff(dayjs(date), 'day') == 1) {
            return '昨天' + dayjs(date).format('HH:mm')
        }
        else if (dayjs(now).diff(dayjs(date), 'day') == 2) {
            return '前天' + dayjs(date).format('HH:mm')
        }
        else {
            return dayjs(date).format('YYYY/MM/DD');
        }
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
}