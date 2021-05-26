import { Block } from "../../..";
/***
 * 内容布局
 */
export declare abstract class ContentAreaComposition extends Block {
    /**内容区域的空白间隔 */
    contentGap: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    isFixedContentWidth: boolean;
    contentWidth: number;
    /**
     * 当前的内容区域是位于左边，还是中间，还是右边，如果宽度是固定的话
     */
    contentAlign: 'left' | 'center' | 'right';
    /**
     * 子区域间距
     */
    childAreaGap: {
        v: number;
        h: number;
    };
}
