import React from "react";
import { Icon } from "../../../component/view/icon";
import { ToolTip } from "../../../component/view/tooltip";
import { S } from "../../../i18n/view";
import { EmojiSvg } from "../../../component/svgs";
import { EmojiView } from "../../emoji/view";
import { EmojiCode } from "../../emoji/store";


export class MaterialEmojiView extends React.Component<{
    change: (data: EmojiCode) => void
}> {
    mode: 'emoji' | '3dEmoji' | 'gifEmoji' = 'emoji';
    render() {
        return <div>
            <div className="flex  gap-t-10  gap-w-10 r-cursor r-gap-r-10 r-size-24 r-flex-center">
                <ToolTip overlay={<S>表情</S>}>
                    <div onMouseDown={e => { this.mode = 'emoji'; this.forceUpdate() }}>
                        <Icon icon={EmojiSvg} size={18}></Icon>
                    </div>
                </ToolTip>
            </div>
            <div>
                {this.mode == 'emoji' && <EmojiView onChange={(d) => {
                    this.props.change({
                        name: 'emoji',
                        code: d.code
                    } as any)
                }}></EmojiView>}
            </div>
        </div>
    }
}