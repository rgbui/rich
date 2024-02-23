import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { TextArea } from "../../../../src/block/view/appear";
import { OriginField, OriginFileView } from "./origin.field";
import { Icon } from "../../../../component/view/icon";
import { PageLayoutType, getPageIcon } from "../../../../src/page/declare";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { Rect } from "../../../../src/common/vector/point";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";

@url('/field/title')
export class FieldText extends OriginField {
    async openPage() {
        this.dataGrid.onOpenEditForm(this.item.dataRow.id);
    }
    onCellMousedown(event: React.MouseEvent<Element, MouseEvent>): void {
        var isDataGridTable = [BlockUrlConstant.DataGridTable].includes(this.dataGrid.url as any);
        if (!isDataGridTable) {
            setTimeout(() => {
                this.page.kit.anchorCursor.onFocusBlockAnchor(this, { last: true })
            }, 200);
        }
    }
}

@view('/field/title')
export class FieldTextView extends OriginFileView<FieldText>{
    span: HTMLElement;
    move(e?: React.MouseEvent) {
        if (this.span) {
            this.span.style.display = 'block';
            var sel = window.getSelection();
            var eg = sel?.focusNode;
            var range = sel.rangeCount > 0 ? sel.getRangeAt(0) : undefined;
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
        var isCard = [
            BlockUrlConstant.DataGridBoard,
            BlockUrlConstant.DataGridGallery
        ].includes(this.block.dataGrid.url as any);
        console.log(this.block.dataGrid.url);
        return <div className={'flex l-20 flex-top sy-field-title  ' + (isCard ? " f-14 bold" : " f-14")} onKeyDown={e => this.keydown(e)} onMouseMove={e => this.move(e)}>
            {!(!this.block.item?.dataRow?.icon && isCard) && <span className="size-20 flex-center inline-flex remark gap-r-3"><Icon size={isCard ? 24 : 18} icon={getPageIcon({
                pageType: PageLayoutType.doc,
                icon: this.block.item?.dataRow?.icon
            })}></Icon></span>}
            <TextArea plain block={this.block} prop='value' placeholder={lst("标题")} ></TextArea>
            {([
                BlockUrlConstant.DataGridTable,
                BlockUrlConstant.DataGridList
            ].includes(this.block.dataGrid.url as any)) && <span ref={e => this.span = e}
                style={{
                    position: this.block.dataGrid.url != BlockUrlConstant.DataGridList ? "absolute" : 'static',
                    marginLeft: this.block.dataGrid.url != BlockUrlConstant.DataGridList ? undefined : 10
                }}
                onClick={e => this.block.openPage()}
                className="sy-field-title-button visible flex-center f-12 text-1 border-light  round padding-w-5 padding-h-1 cursor">
                    <em><S>打开</S></em>
                </span>}
        </div>
    }
}