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
import { util } from "../../../../util/util";
import { Spin } from "../../../../component/view/spin";

@url('/field/title')
export class FieldText extends OriginField {
    async openPage() {
        this.dataGrid.onOpenEditForm(this.dataGridItem.dataRow.id);
    }
    onCellMousedown(event: React.MouseEvent<Element, MouseEvent>): void {
        console.log('xxx');
        setTimeout(() => {
            this.page.kit.anchorCursor.onFocusBlockAnchor(this, { last: true })
        }, 50);
    }
    get isDisabledInputLine() {
        return true;
    }
}

@view('/field/title')
export class FieldTextView extends OriginFileView<FieldText> {
    span: HTMLElement;
    move(e?: React.MouseEvent) {
        if (this.span) {
            this.span.style.display = 'block';
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
        var isCard = [
            BlockUrlConstant.DataGridBoard,
            BlockUrlConstant.DataGridGallery
        ].includes(this.block.dataGrid.url as any);

        var isSub = [BlockUrlConstant.DataGridTable, BlockUrlConstant.DataGridList].includes(this.block.dataGrid.url as any) && this.block.dataGrid.schema?.allowSubs;

        return <div className={'flex l-20 flex-top sy-field-title  ' + (isCard ? " f-14 bold" : " b-500 f-14")} onKeyDown={e => this.keydown(e)} onMouseMove={e => this.move(e)}>

            {isSub && <span className={" size-24 inline-flex remark gap-r-3 round item-hover cursor flex-center ts " + (this.block.dataGridItem.subSpread ? "angle-90 " : (this.block.dataGridItem.dataRow.subCount > 0 ? "" : " visible"))} onMouseDown={async e => {
                e.stopPropagation();
                await this.block.dataGridItem.onSpreadSub();
                this.forceUpdate()
            }} >
                {this.block.dataGridItem.subList.loading && <Spin></Spin>}
                {!this.block.dataGridItem.subList.loading && <Icon size={18} icon={{ name: "byte", code: "right" }}></Icon>}
            </span>}

            {!(!this.block.dataGridItem?.dataRow?.icon && isCard) && <span className="size-20 flex-center inline-flex remark gap-r-3"><Icon size={isCard ? 20 : 18} icon={getPageIcon({
                pageType: PageLayoutType.doc,
                icon: this.block.dataGridItem?.dataRow?.icon
            })}></Icon></span>}

            <TextArea plain block={this.block} prop='value' placeholder={lst("标题")} ></TextArea>
            {([
                BlockUrlConstant.DataGridTable,
                BlockUrlConstant.DataGridList
            ].includes(this.block.dataGrid.url as any)) && <span ref={e => this.span = e}
                style={{
                    position: 'absolute',
                    right: this.block.dataGrid.url != BlockUrlConstant.DataGridList ? undefined : -40,
                    transform: 'translateY(-2px)'
                }}
                onClick={e => this.block.openPage()}
                className="sy-field-title-button visible flex-center f-12 text-1 border-light  round padding-w-5 padding-h-1 cursor">
                    <em><S>打开</S></em>
                </span>}
        </div>
    }
}