import React from "react";
import { Flow } from ".";
import { FlowCommandFactory } from "./factory/block.factory";
import { S } from "../../i18n/view";
import { PlusSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { DragList } from "../../component/view/drag.list";

export class FlowView extends React.Component<{ flow: Flow }> {
    constructor(props) {
        super(props)
        this.props.flow.view = this;
    }
    renderCommands() {
        return <DragList isDragBar={e => { return e.closest('.drag') ? true : false }}
            onChange={(to, from) => {
                this.props.flow.commands.move(this.props.flow.commands[from], to);
                this.forceUpdate();
            }}>{this.props.flow.commands.map(n => {
                var CView = FlowCommandFactory.getView(n.url);
                return <CView key={n.id} command={n} />
            })}
        </DragList>
    }
    render() {
        return <div className="f-14" onMouseDown={e => e.stopPropagation()}>
            <div className="f-12 remark flex gap-t-15 gap-b-5"><S>当按钮被点击时</S></div>
            {this.renderCommands()}
            <div className="flex remark item-hover round padding-w-5 h-30 cursor " onMouseDown={e => this.props.flow.openAddStep(e)} ><span className="flex-center    round"><Icon size={20} icon={PlusSvg}></Icon><span><S>添加下一步</S></span></span></div>
        </div>
    }
}