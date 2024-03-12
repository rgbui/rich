import React from "react";
import { Icon } from "../../component/view/icon";
import { useIconPicker } from "../../extensions/icon";
import { IconArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { Rect } from "../../src/common/vector/point";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { lst } from "../../i18n/store";

@url('/icon')
export class BlockIcon extends Block {
    @prop()
    src: IconArguments = { name: 'byte', code: 'hamburger-button' };
    @prop()
    size: number = 32;
    display = BlockDisplay.block;
    async getHtml() {
        if (this.src && this.src.code) {
            return `<span>${this.src.code}</span>`
        }
        else return '';
    }
    async getMd() {
        return this.src?.code || '';
    }
    async onGetContextMenus() {
        if (this.isFreeBlock) {
            return await this.onGetBoardContextMenus()
        }
        var rs = await super.onGetContextMenus();
        var alignItem = rs.find(g => g.name == 'text-center');
        if (alignItem) {
            alignItem.text = lst('对齐')
        }
        var at = rs.findIndex(c => c.name == 'color');
        var ns = [8, 12, 16, 24, 32, 48, 64, 72, 96, 128, 144, 180, 256];
        rs.splice(at, 0, ...[
            {
                text: '大小',
                icon: { name: 'byte', code: 'zoom-in' } as any,
                childs: ns.map(n => {
                    return {
                        name: 'size', text: n.toString(), value: n, checkLabel: this.size == n
                    }
                })
            },
            {
                type: MenuItemType.divide
            }
        ]);
        return rs;
    }
    async onClickContextMenu(item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        if (item?.name == 'size') {
            await this.page.onAction('iconSize', async () => {
                await this.updateProps({ size: item.value }, BlockRenderRange.self);
            });
            return;
        }
        await super.onClickContextMenu(item, event);
    }
    @prop()
    align: 'left' | 'center' = 'left';
    getVisibleHandleCursorPoint() {
        var icon = this.el.querySelector('.flex-center') as HTMLElement;
        var rect = Rect.fromEle(icon);
        var point = rect.leftMiddle;
        return point;
    }

}

@view('/icon')
export class BlockIconView extends BlockView<BlockIcon>{
    async openEdit(event: React.MouseEvent) {
        event.stopPropagation();
        var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) }, this.block.src);
        if (typeof icon != 'undefined') {
            if (icon == null) this.block.onDelete()
            else this.block.onUpdateProps({ src: icon }, { range: BlockRenderRange.self });
        }
    }

    renderView() {
        var icon = this.block.src;
        if (icon.code && (icon as any).mime) {
            icon = { name: 'emoji', code: icon.code };
        }
        var cs = this.block.contentStyle;
        var bg = cs.backgroundColor;
        delete cs.backgroundColor;
        if (this.block.align == 'center') cs.justifyContent = 'center';
        else if (this.block.align == 'left') cs.justifyContent = 'flex-start';
        else if (this.block.align == 'right') cs.justifyContent = 'flex-end';
        return <div style={this.block.visibleStyle}>
            <div className="flex" style={cs}>
                <div className="flex-center" onMouseDown={e => this.openEdit(e)} style={{
                    backgroundColor: bg,
                    width: this.block.size + 10,
                    height: this.block.size + 10,
                    borderRadius: 5,
                    cursor: 'pointer'
                }}>
                    <Icon icon={{ ...icon }} size={this.block.size}></Icon>
                </div>
            </div>
        </div>
    }
}