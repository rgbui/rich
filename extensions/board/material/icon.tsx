import React from "react";
import { ByteDanceIconView } from "../../byte-dance.icons/view";
import { FontAwesomeView } from "../../font-awesome";
import { Icon } from "../../../component/view/icon";
import { FontawesomeSvg } from "../../../component/svgs";
import { ToolTip } from "../../../component/view/tooltip";
import { S } from "../../../i18n/view";

export class MaterialIconView extends React.Component<{
    change: (data: { code: string, color?: string }) => void
}> {
    mode: 'byte' | 'fontAwesome' = 'byte';
    render() {
        return <div className="flex flex-col flex-full ">
            <div className="flex-fixed gap-t-10 gap-w-10 flex r-cursor r-gap-r-10 r-size-24 r-flex-center">
                <ToolTip overlay={<S>SVG图标</S>}>
                    <div className={this.mode == 'byte' ? "text-p item-hover-focus round" : ""} onMouseDown={e => { this.mode = 'byte'; this.forceUpdate() }}>
                        <Icon icon={{ name: 'bytedance-icon', code: 'oval-love-two' }} size={18}></Icon>
                    </div>
                </ToolTip>

                <ToolTip overlay={<span>FontAwesome</span>}>
                    <div className={this.mode == 'byte' ? "text-p item-hover-focus round" : ""} onMouseDown={e => { this.mode = 'fontAwesome'; this.forceUpdate() }}>
                        <Icon icon={FontawesomeSvg} size={24}></Icon>
                    </div>
                </ToolTip>

            </div>
            <div className="flex-auto ">
                {this.mode == 'byte' && <ByteDanceIconView height={'100%'} onChange={(d) => { this.props.change({ name: "byte", ...d } as any) }}></ByteDanceIconView>}
                {this.mode == 'fontAwesome' && <FontAwesomeView height={'100%'} onChange={(d) => { this.props.change({ name: 'font-awesome', ...d } as any) }}></FontAwesomeView>}
            </div>
        </div>
    }
}