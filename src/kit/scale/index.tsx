import React from "react";
import { ReactNode } from "react";
import { Kit } from "..";
import { Icon } from "../../../component/view/icon";
import { Point } from "../../common/vector/point";
import { FitSvg, MinusSvg, PlusSvg } from "../../../component/svgs";

export class BoardScale extends React.Component<{ kit: Kit }>{
    render(): ReactNode {
        if (!this.props.kit.page.isBoard) return <></>
        return <div className="text pos pos-right pos-bottom gap-r-30 gap-b-30 h-30 bg-white border round-4  flex r-flex-center">
            <span className="item-hover cursor size-30"><Icon size={18} icon={FitSvg} onMousedown={e => this.props.kit.page.onFitZoom()}></Icon></span>
            <span className="item-hover cursor size-30"><Icon size={18}  icon={PlusSvg} onMousedown={e => this.props.kit.page.onZoom(25, Point.from(e))} ></Icon></span>
            <span className="text-1 f-12 padding-w-3">{(this.props.kit.page.scale * 100).toFixed(0)}%</span>
            <span className="item-hover cursor size-30"><Icon size={18}  icon={MinusSvg} onMousedown={e => this.props.kit.page.onZoom(-25, Point.from(e))} ></Icon></span>
        </div>
    }
}