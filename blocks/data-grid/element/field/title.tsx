import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { TextArea } from "../../../../src/block/view/appear";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";
import { Icon } from "../../../../component/view/icon";
import { PageLayoutType, getPageIcon } from "../../../../src/page/declare";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { Rect } from "../../../../src/common/vector/point";

@url('/field/title')
export class FieldText extends OriginField {
    async openPage() {
        this.dataGrid.onOpenEditForm(this.item.dataRow.id);
    }
}
@view('/field/title')
export class FieldTextView extends BlockView<FieldText>{
    span: HTMLElement;
    move(e?: React.MouseEvent) {
        if (this.span) {
            this.span.style.display = 'block';
            var sel = window.getSelection();
            var eg = sel?.focusNode;
            var range = sel.getRangeAt(0);
            if (eg && this.span.parentNode.contains(eg) && range) {
                var sg = Rect.fromEle(range);
                var r = Rect.fromEle(this.span);
                r = r.extend(20);
                if (sg.isCross(r)) {
                    this.span.style.display = 'none';
                }
            }
        }
    }
    keydown(e: React.KeyboardEvent) {
        this.move()
    }
    render() {
        return <div className='flex l-20 flex-top sy-field-title f-14' onKeyDown={e => this.keydown(e)} onMouseMove={e => this.move(e)}>
            <span className="size-20 flex-center inline-flex text-1 gap-r-3"><Icon size={20} icon={getPageIcon({
                pageType: PageLayoutType.doc,
                icon: this.block.item?.dataRow?.icon
            })}></Icon></span>
            <TextArea plain block={this.block} prop='value' placeholder="标题" ></TextArea>
            {this.block.dataGrid.url == BlockUrlConstant.DataGridTable && <span ref={e => this.span = e} onClick={e => this.block.openPage()} className="sy-field-title-button visible flex-center f-12 text-1 border  round padding-w-5 padding-h-2 cursor">
                <em>打开</em>
            </span>}
        </div>
    }
}