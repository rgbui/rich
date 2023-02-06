import React from "react";
import { EditSvg } from "../../../../component/svgs";
import { useShyRichEditor } from "../../../../component/view/editor";
import { Icon } from "../../../../component/view/icon";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";

@url('/field/rich')
export class FieldRich extends OriginField {
    async onOpenEditRich(event: React.MouseEvent) {
        var g = await useShyRichEditor({
            html: this.value?.content || ''
        });
        if (g) {
            await this.onUpdateCellValue({ content: g.content, text: g.text.slice(0, 200), pics: g.pics });
            this.forceUpdate();
        }
    }
}
@view('/field/rich')
export class FieldRichView extends BlockView<FieldRich>{
    render() {
        var size = 80;
        return <div className='sy-field-text f-14'>
            {(this.block.value?.text || "").slice(0, size)}
            <span onMouseDown={e => this.block.onOpenEditRich(e)} className="size-20 round-4 flex-center flex-inline cursor item-hover"><Icon style={{ 'transform': 'translate(0px, 3px)' }} icon={EditSvg} size={16}></Icon></span>
        </div>
    }
}