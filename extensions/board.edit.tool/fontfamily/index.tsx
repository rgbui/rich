import React from "react"
import { BoardEditTool } from ".."
import { CheckSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { FontFamilyStyle, GetFontStores, loadFontFamily } from "./store"
import { lst } from "../../../i18n/store";
import { Tip } from "../../../component/view/tooltip/tip";
import { Loading2 } from "../../../component/view/spin";
import { ToolTip } from "../../../component/view/tooltip";

export class FontFamily extends React.Component<{
    tool: BoardEditTool,
    value: string,
    change?(value: string): void
}> {
    render() {
        var props = this.props;
        var self = this;
        async function changeFont(ft: FontFamilyStyle) {
            props.change(ft.name);
            load(ft);
        }
        async function load(ft: FontFamilyStyle) {
            if (ft.loading !== true && ft.loaded !== true) {
                ft.loading = true;
                self.forceUpdate();
                await loadFontFamily(ft.name)
                self.forceUpdate();
            }
        }
        return <div className="relative" >
            <div className="h-20" style={{ marginTop: 2, minWidth: 20, minHeight: 20 }} onMouseDown={e => props.tool.showDrop('fontFamily')}>
                {GetFontStores().find(c => c.name == props.value)?.text || lst('默认')}
            </div>
            {props.tool.isShowDrop('fontFamily') && <div style={{ top: 35 }} className="w-250 z-2 bg-white max-h-300 overflow-y pos shadow-s padding-h-10 round ">
                {GetFontStores().map(c => {
                    return <div className="flex h-30 padding-w-5 gap-w-5  round cursor"
                        onMouseDown={e => changeFont(c)}
                        key={c.name}
                    >
                        <span className="flex-fixed size-24">
                            {(c.name == props.value || c.name == '' && !props.value) && <span className="flex-center size-24"><Icon size={18} icon={CheckSvg}></Icon></span>}
                        </span>
                        <ToolTip overlay={<span>{c.text}</span>}>
                            {c.imgUrl ? <span className="flex-auto "><img draggable={false} style={{ userSelect: 'none' }} src={c.imgUrl} className="h-20  " /></span> : <span className="flex-auto text-overflow" style={{ fontFamily: c.name }}>{c.text}</span>}
                        </ToolTip>
                        {c.name != 'inherit' && <span className="flex-fixed flex">
                            {
                                c.loaded && <span className="flex-center size-24 cursor"><Icon icon={{ name: 'bytedance-icon', code: 'local-pin' }} size={18}></Icon></span>
                            }
                            {c.loaded !== true && c.loading !== true && <Tip text='下载字体'><span onMouseDown={e => {
                                e.stopPropagation();
                                load(c)
                            }} className="flex-center size-24 cursor">
                                <Icon icon={{ name: 'bytedance-icon', code: 'download-one' }} size={18}></Icon>
                            </span></Tip>}
                            {c.loaded !== true && c.loading == true && <span className="flex-center size-24">
                                <Loading2 size={20}></Loading2>
                            </span>}
                        </span>}
                    </div>
                })}
            </div>}
        </div>
    }
}

