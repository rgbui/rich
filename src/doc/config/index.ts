
/***
 * 页面的配置
 */

import { util } from "../../util/util";

export class PageConfig {
    /**
     * 文字默认的行高
     */
    lineHeight: number = 16;
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