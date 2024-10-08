import React from "react";
import { Kit } from "..";
import { Icon } from "../../../component/view/icon";
import { Point } from "../../common/vector/point";
import { PlusSvg } from "../../../component/svgs";
import { Tip } from "../../../component/view/tooltip/tip";
import { UA } from "../../../util/ua";
import { S } from "../../../i18n/view";

export class BoardScale extends React.Component<{ kit: Kit }> {
    render() {
        if (!this.props.kit.page.isBoard) return <></>
        return <div style={{
            zIndex: 10001
        }} className="text pos pos-right pos-bottom gap-r-30 gap-b-30 h-30 bg-white border shadow-s round  flex r-flex-center">
            <Tip text='自适应屏幕'><span className="item-hover cursor size-30" onMouseDown={e => this.props.kit.page.onFitZoom()}><Icon size={18} icon={{ name: 'bytedance-icon', code: 'auto-width' }} ></Icon></span></Tip>
            <Tip overlay={UA.isMacOs ? <S>缩小</S> : <span className="flex-center"><S>缩小</S><br />Ctrl+滚轮 ↓</span>}  ><span className="item-hover cursor size-30" onMouseDown={e => this.props.kit.page.onZoom(-1, Point.from(e))}><Icon size={18} icon={{ name: 'bytedance-icon', code: 'minus' }}  ></Icon></span></Tip>
            <Tip text='缩放至100%'><span className="text-1 f-12  cursor  padding-w-3" onMouseDown={e => this.props.kit.page.onZoom(100)}>{(this.props.kit.page.scale * 100).toFixed(0)}%</span></Tip>
            <Tip overlay={UA.isMacOs ? <S>放大</S> : <span  className="flex-center"><S>放大</S><br />Ctrl+滚轮 ↑</span>} ><span className="item-hover cursor size-30" onMouseDown={e => this.props.kit.page.onZoom(1, Point.from(e))}><Icon size={18} icon={PlusSvg}  ></Icon></span></Tip>
            <Tip text='地图'><span className="item-hover cursor size-30" onMouseDown={e => this.props.kit.boardMap.open()}><Icon size={18} icon={{ name: 'byte', code: 'map-draw' }}  ></Icon></span></Tip>
        </div>
    }
}