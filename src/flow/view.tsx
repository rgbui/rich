import React from "react";
import { Flow } from ".";
import { FlowCommandFactory } from "./factory/block.factory";
import { S } from "../../i18n/view";
import { PlusSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { DragList } from "../../component/view/drag.list";
import { HelpText } from "../../component/view/text";

export class FlowView extends React.Component<{ flow: Flow, onChange: () => Promise<void> }> {
    constructor(props) {
        super(props)
        this.props.flow.view = this;
    }
    async onChange() {
        if (this.props.onChange)
            await this.props.onChange()
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
        return <div className="f-14 gap-h-10 " onMouseDown={e => e.stopPropagation()}>
            <div className="f-12 remark flex gap-w-10 gap-t-10 gap-b-5">
                <span className="flex-fixed"><S>当按钮被点击时</S></span>
                <span className="flex-auto flex-end">
                    <HelpText url={window.shyConfig?.isUS ? "https://help.shy.red/page/73#pdNvMSxKmxCYX6Q4dAyHm3" : "https://help.shy.live/page/2002#sr8s6iSaarGuvkhgkuRQar"}><S>了解如何添加动作</S></HelpText>
                </span>
            </div>
            <div className="gap-w-10">{this.renderCommands()}</div>
            <div className="flex text-1 item-hover round padding-w-5 gap-w-10 h-30 cursor " onMouseDown={e => this.props.flow.openAddStep(e)} ><span className="flex-center    round"><Icon size={20} icon={PlusSvg}></Icon><span><S>添加下一步</S></span></span></div>
        </div>
    }
}