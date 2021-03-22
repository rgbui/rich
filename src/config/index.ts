
/***
 * 页面的配置
 */

import { util } from "../util/util";



export class PageConfig {
    fontSize: number = 14;
    /**
     * 文字默认的行高
     */
    lineHeight: number = 20;
    /**
     * 文字的字间距
     */
    letterSpaceing: number = 0;
    load(props: Record<string, any>) {
        for (var n in props) {
            this[n] = util.clone(props[n]);
        }
    }
}