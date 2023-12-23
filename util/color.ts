const INT_HEX_MAP = { 10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F' };
export type RGBA = {
    r: number,
    g: number,
    b: number,
    a: number
} & string;
// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
const isOnePointZero = function (n) {
    return typeof n === 'string' && n.indexOf('.') !== -1 && parseFloat(n) === 1;
};
const isPercentage = function (n) {
    return typeof n === 'string' && n.indexOf('%') !== -1;
};
const bound01 = function (value, max) {
    if (isOnePointZero(value)) value = '100%';
    const processPercent = isPercentage(value);
    value = Math.min(max, Math.max(0, parseFloat(value)));
    // Automatically convert percentage into number
    if (processPercent) {
        value = parseInt((value * max) as any, 10) / 100;
    }
    // Handle floating point rounding errors
    if ((Math.abs(value - max) < 0.000001)) {
        return 1;
    }
    // Convert into [0, 1] range if it isn't already
    return (value % max) / parseFloat(max);
};
const HEX_INT_MAP = { A: 10, B: 11, C: 12, D: 13, E: 14, F: 15 };
const parseHexChannel = function (hex) {
    if (hex.length === 2) {
        return (HEX_INT_MAP[hex[0].toUpperCase()] || +hex[0]) * 16 + (HEX_INT_MAP[hex[1].toUpperCase()] || +hex[1]);
    }
    return HEX_INT_MAP[hex[1].toUpperCase()] || +hex[1];
};
export class ColorUtil {
    static toHex(rgba: { r: number, g: number, b: number, a?: number }): string {
        let { r, g, b } = rgba;
        const hexOne = function (value) {
            value = Math.min(Math.round(value), 255);
            const high = Math.floor(value / 16);
            const low = value % 16;
            return '' + (INT_HEX_MAP[high] || high) + (INT_HEX_MAP[low] || low);
        };
        if (isNaN(r) || isNaN(g) || isNaN(b)) return '';
        return '#' + hexOne(r) + hexOne(g) + hexOne(b);
    }
    /****
     * 
     * a in[0,100]
     */
    static toRGBA(rgba: { r: number, g: number, b: number, a?: number }): string {
        if (typeof rgba.a == 'undefined') return `rgb(${rgba.r},${rgba.g},${rgba.b})`;
        else return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a / 100.0})`;
    }
    // `rgbToHsv`
    // Converts an RGB color value to HSV
    // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
    // *Returns:* { h, s, v } in [0,1]
    static rgb2hsv(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s;
        let v = max;

        const d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max === min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, v: v * 100 };
    };
    // `hsvToRgb`
    // Converts an HSV color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
    static hsv2rgb(h, s, v) {
        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);
        const i = Math.floor(h);
        const f = h - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        const mod = i % 6;
        const r = [v, q, p, p, t, v][mod];
        const g = [t, v, v, q, p, p][mod];
        const b = [p, p, t, v, v, q][mod];

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    };
    static hsl2hsv(hue, sat, light) {
        sat = sat / 100;
        light = light / 100;
        let smin = sat;
        const lmin = Math.max(light, 0.01);
        let sv;
        let v;

        light *= 2;
        sat *= (light <= 1) ? light : 2 - light;
        smin *= lmin <= 1 ? lmin : 2 - lmin;
        v = (light + sat) / 2;
        sv = light === 0 ? (2 * smin) / (lmin + smin) : (2 * sat) / (light + sat);

        return {
            h: hue,
            s: sv * 100,
            v: v * 100
        };
    };
    /***
     * 
     * 返回的透明度为100
     */
    static parseToHsv(value: string): { h: number, s: number, v: number, a: number } {
        var h: number, s: number, v: number, a = 100;
        if (!value) {
            h = 0;
            s = 100;
            v = 100;
            return { h, s, v, a };
        }
        const fromHSV = (h, s, v) => {
            h = Math.max(0, Math.min(360, h));
            s = Math.max(0, Math.min(100, s));
            v = Math.max(0, Math.min(100, v));
            return { h, s, v, a };
        };
        if (!value) {
            value = 'transparent';
        }
        if (typeof value != 'string') {
            console.log('color value is not string');
            console.trace(value);
            value = 'transparent';
        }
        if (value.toLowerCase() == 'transparent') {
            value = 'rgba(0,0,0,0)';
        }
        if (value.indexOf('hsl') !== -1) {
            const parts = value.replace(/hsla|hsl|\(|\)/gm, '')
                .split(/\s|,/g).filter((val) => val !== '').map((val, index) => index > 2 ? parseFloat(val) : parseInt(val, 10));

            if (parts.length === 4) {
                a = Math.floor(parseFloat(parts[3].toString()) * 100);
            } else if (parts.length === 3) {
                a = 100;
            }
            if (parts.length >= 3) {
                const { h, s, v } = this.hsl2hsv(parts[0], parts[1], parts[2]);
                return fromHSV(h, s, v);
            }
        } else if (value.indexOf('hsv') !== -1) {
            const parts = value.replace(/hsva|hsv|\(|\)/gm, '')
                .split(/\s|,/g).filter((val) => val !== '').map((val, index) => index > 2 ? parseFloat(val) : parseInt(val, 10));

            if (parts.length === 4) {
                a = Math.floor(parseFloat(parts[3].toString()) * 100);
            } else if (parts.length === 3) {
                a = 100;
            }
            if (parts.length >= 3) {
                return fromHSV(parts[0], parts[1], parts[2]);
            }
        } else if (value.indexOf('rgb') !== -1) {
            const parts = value.replace(/rgba|rgb|\(|\)/gm, '')
                .split(/\s|,/g).filter((val) => val !== '').map((val, index) => index > 2 ? parseFloat(val) : parseInt(val, 10));

            if (parts.length === 4) {
                a = Math.floor(parseFloat(parts[3].toString()) * 100);
            } else if (parts.length === 3) {
                a = 100;
            }
            if (parts.length >= 3) {
                const { h, s, v } = this.rgb2hsv(parts[0], parts[1], parts[2]);
                return fromHSV(h, s, v);
            }
        } else if (value.indexOf('#') !== -1) {
            const hex = value.replace('#', '').trim();
            let r, g, b;

            if (hex.length === 3) {
                r = parseHexChannel(hex[0] + hex[0]);
                g = parseHexChannel(hex[1] + hex[1]);
                b = parseHexChannel(hex[2] + hex[2]);
            } else if (hex.length === 6 || hex.length === 8) {
                r = parseHexChannel(hex.substring(0, 2));
                g = parseHexChannel(hex.substring(2, 4));
                b = parseHexChannel(hex.substring(4, 6));
            }
            if (hex.length === 8) {
                a = Math.floor(parseHexChannel(hex.substring(6)) / 255 * 100);
            } else if (hex.length === 3 || hex.length === 6) {
                a = 100;
            }
            const { h, s, v } = this.rgb2hsv(r, g, b);
            return fromHSV(h, s, v);
        }
    }
    static parseColor(value: string) {
        if (!value) {
            value = 'transparent';
        }
        if (typeof value != 'string') {
            console.log('color value is not string');
            console.trace(value);
            value = 'transparent';
        }
        if (value.toLowerCase() == 'transparent') {
            value = 'rgba(0,0,0,0)';
        }
        value = value.trim();
        if (value.startsWith('hsl')) {
            var h: number, s: number, v: number, a = 100;
            const parts = value.replace(/hsla|hsl|\(|\)/gm, '')
                .split(/\s|,/g).filter((val) => val !== '').map((val, index) => index > 2 ? parseFloat(val) : parseInt(val, 10));

            if (parts.length === 4) {
                a = Math.floor(parseFloat(parts[3].toString()) * 100);
            } else if (parts.length === 3) {
                a = 100;
            }
            if (parts.length >= 3) {
                const { h, s, v } = this.hsl2hsv(parts[0], parts[1], parts[2]);
                var c = this.hsv2rgb(h, s, v) as { r: number, g: number, b: number, a: number };
                c.a = a / 100;
                return c;
            }
        }
        else if (value.startsWith('hsv')) {
            var h: number, s: number, v: number, a = 100;
            const parts = value.replace(/hsva|hsv|\(|\)/gm, '')
                .split(/\s|,/g).filter((val) => val !== '').map((val, index) => index > 2 ? parseFloat(val) : parseInt(val, 10));

            if (parts.length === 4) {
                a = Math.floor(parseFloat(parts[3].toString()) * 100);
            } else if (parts.length === 3) {
                a = 100;
            }
            if (parts.length >= 3) {
                var c = this.hsv2rgb(parts[0], parts[1], parts[2]) as { r: number, g: number, b: number, a: number };
                c.a = a / 100;
                return c;
            }
        }
        else if (value.startsWith('rgb')) {
            var h: number, s: number, v: number, a = 100;
            const parts = value.replace(/rgba|rgb|\(|\)/gm, '')
                .split(/\s|,/g).filter((val) => val !== '').map((val, index) => index > 2 ? parseFloat(val) : parseInt(val, 10));
            if (parts.length === 4) {
                a = Math.floor(parseFloat(parts[3].toString()) * 100);
            } else if (parts.length === 3) {
                a = 100;
            }
            if (parts.length >= 3) {
                return {
                    r: parts[0],
                    g: parts[1],
                    b: parts[2],
                    a: a / 100
                }
            }
        }
        else if (value.startsWith('#')) {
            const hex = value.replace('#', '').trim();
            let r, g, b;

            if (hex.length === 3) {
                r = parseHexChannel(hex[0] + hex[0]);
                g = parseHexChannel(hex[1] + hex[1]);
                b = parseHexChannel(hex[2] + hex[2]);
            } else if (hex.length === 6 || hex.length === 8) {
                r = parseHexChannel(hex.substring(0, 2));
                g = parseHexChannel(hex.substring(2, 4));
                b = parseHexChannel(hex.substring(4, 6));
            }
            if (hex.length === 8) {
                a = Math.floor(parseHexChannel(hex.substring(6)) / 255 * 100);
            } else if (hex.length === 3 || hex.length === 6) {
                a = 100;
            }
            return {
                r: r, g, b, a: a / 100
            }
        }
    }
    /***
     * @percentage in [0,100]
     *
     */
    static lineGradient(from: { color: RGBA, percentage?: number }, to: { color: RGBA, percentage?: number }, percentage: number) {
        if (typeof from.percentage == 'undefined') from.percentage = 0;
        if (typeof to.percentage == 'undefined') to.percentage = 100;
        var fromHsv = this.parseToHsv(from.color);
        var toHsv = this.parseToHsv(to.color);
        var d = (percentage - from.percentage) * 100.0 / (to.percentage - from.percentage);
        d = d / 100.0;
        var hsv = {
            h: parseFloat((fromHsv.h + (toHsv.h - fromHsv.h) * d).toString()),
            s: parseFloat((fromHsv.s + (toHsv.s - fromHsv.s) * d).toString()),
            v: parseFloat((fromHsv.v + (toHsv.v - fromHsv.v) * d).toString()),
            a: parseFloat((fromHsv.a + (toHsv.a - fromHsv.a) * d).toString()),
        };
        var rgb: { r: number, g: number, b: number, a?: number } = this.hsv2rgb(hsv.h, hsv.s, hsv.v);
        rgb.a = hsv.a;
        return this.toRGBA(rgb);
    }
}