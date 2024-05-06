import React from "react";
import { LinkSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { url, view } from "../../../../src/block/factory/observable";
import { OriginField, OriginFileView } from "./origin.field";
import { TextArea } from "../../../../src/block/view/appear";
import { Rect } from "../../../../src/common/vector/point";
import { lst } from "../../../../i18n/store";
import { Tip } from "../../../../component/view/tooltip/tip";
import { util } from "../../../../util/util";

@url('/field/url')
export class FieldUrl extends OriginField {

}

@view('/field/url')
export class FieldUrlView extends OriginFileView<FieldUrl>{
    isCom: boolean = false;
    span: HTMLElement;
    move(e?: React.MouseEvent) {
        if (this.span) {
            this.span.style.display = 'flex';
            var sel = window.getSelection();
            var eg = sel?.focusNode;
            var range = sel.rangeCount > 0 ? util.getSafeSelRange(sel) : undefined;
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
    renderFieldValue() {
        return <div className={'flex l-20 text-1  flex-top sy-field-title   f-14 '} onKeyDown={e => this.keydown(e)} onMouseMove={e => this.move(e)}>
            <TextArea plain block={this.block} prop='value' placeholder={lst("网址")} ></TextArea>
            {this.block.value && this.block.value.startsWith('http') && <Tip text={'打开网址'}><a ref={e => this.span = e} href={this.block.value} target="_blank" className={"pos-t-r item-hover visible flex-center size-20 text-1 border  round  cursor bg-hover " + ((this.block?.value as string)?.startsWith('http') ? " " : "hidden")}>
                <Icon size={16} icon={LinkSvg}></Icon>
            </a></Tip>}
        </div>
    }
}