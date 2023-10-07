import React from "react";
import { Kit } from "..";
import { Icon } from "../../../component/view/icon";
import { Point } from "../../common/vector/point";
import { PlusSvg } from "../../../component/svgs";
import { Tip } from "../../../component/view/tooltip/tip";

export class BoardScale extends React.Component<{ kit: Kit }>{
    render() {
        if (!this.props.kit.page.isBoard) return <></>
        return <div className="text pos pos-right pos-bottom gap-r-30 gap-b-30 h-30 bg-white border round-4  flex r-flex-center">
            <Tip text='自适应屏幕'><span className="item-hover cursor size-30"><Icon size={18} icon={{ name: 'bytedance-icon', code: 'auto-width' }} onMousedown={e => this.props.kit.page.onFitZoom()}></Icon></span></Tip>
            <Tip text='缩小'><span className="item-hover cursor size-30"><Icon size={18} icon={{ name: 'bytedance-icon', code: 'minus' }} onMousedown={e => this.props.kit.page.onZoom(-1, Point.from(e))} ></Icon></span></Tip>
            <Tip text='缩放至100%'><span className="text-1 f-12  cursor  padding-w-3" onMouseDown={e => this.props.kit.page.onZoom(100)}>{(this.props.kit.page.scale * 100).toFixed(0)}%</span></Tip>
            <Tip text='放大'><span className="item-hover cursor size-30"><Icon size={18} icon={PlusSvg} onMousedown={e => this.props.kit.page.onZoom(1, Point.from(e))} ></Icon></span></Tip>
        </div>
    }
}