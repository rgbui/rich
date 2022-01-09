import React from "react";
import { ReactNode } from "react";
import { Kit } from "..";
import PlusSvg from "../../assert/svg/plus.2.svg";
import MinusSvg from "../../assert/svg/minus.svg";
import FitSvg from "../../assert/svg/fit.svg";
import { Icon } from "../../../component/view/icon";
import { Point } from "../../common/vector/point";
export class BoardScale extends React.Component<{ kit: Kit }>{
    render(): ReactNode {
        return <div className="shy-board-scale">
            <Icon icon={FitSvg} mousedown={e=>this.props.kit.page.onFitZoom()}></Icon>
            <Icon icon={PlusSvg} mousedown={e => this.props.kit.page.onZoom(25, Point.from(e))} ></Icon>
            <span>{(this.props.kit.page.scale * 100).toFixed(0)}%</span>
            <Icon icon={MinusSvg} mousedown={e => this.props.kit.page.onZoom(-25, Point.from(e))} ></Icon>
        </div>
    }
}