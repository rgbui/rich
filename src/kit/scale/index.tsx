import React from "react";
import { ReactNode } from "react";
import { Kit } from "..";
import { Icon } from "../../../component/view/icon";
import { Point } from "../../common/vector/point";
import { FitSvg, MinusSvg, PlusSvg } from "../../../component/svgs";

export class BoardScale extends React.Component<{ kit: Kit }>{
    render(): ReactNode {
        if (!this.props.kit.page.isBoard) return <></>
        return <div className="shy-board-scale">
            <Icon icon={FitSvg} onMousedown={e => this.props.kit.page.onFitZoom()}></Icon>
            <Icon icon={PlusSvg} onMousedown={e => this.props.kit.page.onZoom(25, Point.from(e))} ></Icon>
            <span>{(this.props.kit.page.scale * 100).toFixed(0)}%</span>
            <Icon icon={MinusSvg} onMousedown={e => this.props.kit.page.onZoom(-25, Point.from(e))} ></Icon>
        </div>
    }
}