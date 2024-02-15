import React from "react";
import { BoardEditTool } from ".";
import { TransparentSvg } from "../../component/svgs";
import { MeasureView } from "../../component/view/progress";
import { S } from "../../i18n/view";
import { lst } from "../../i18n/store";
import { BoardBackgroundColorList } from "../color/data";
import { ColorListBox } from "../color/list";
import { Icon } from "../../component/view/icon";

export function ShapeFill(props: { tool: BoardEditTool, fillColor: string, fillOpacity: number, change: (name: string, value: any, isLazy?: boolean) => void }) {
    function renderSvg() {
        if (props.fillColor == 'transparent') return <Icon icon={TransparentSvg} size={16}></Icon> 
        else return <a style={{ display: 'inline-block', borderRadius: '50%', opacity: props.fillOpacity, backgroundColor: props.fillColor }}></a>
    }
    var colors = BoardBackgroundColorList();
    colors.splice(0, 0, { color: 'transparent', text: lst('透明') })

    return <div className="shy-shape-fill">
        <div className="shy-shape-fill-current flex-center" onMouseDown={e => props.tool.showDrop('fill')}>{renderSvg()}</div>
        {props.tool.isShowDrop('fill') && <div style={{ width: 230 }} className="shy-shape-fill-drops padding-w-10">
            <div className="shy-shape-fill-opacity gap-h-10">
                <div className="shy-measure-view-label"><label className="f-12 remark"><S>透明度</S></label><span className="f-12 remark" style={{ float: 'right' }}>{props.fillOpacity}</span></div>
                <MeasureView theme="light" min={0} ratio={0.1} max={1} showValue={false} value={props.fillOpacity} inputting={false} onChange={e => { props.change('fillOpacity', e) }}></MeasureView>
            </div>
            <div className="gap-h-10">
                <ColorListBox title={lst('填充色')} name={'fillColor'} colors={colors} value={props.fillColor} onChange={e => {
                    props.change('fillColor', e.color)
                }}></ColorListBox>
            </div>
        </div>}
    </div>
}