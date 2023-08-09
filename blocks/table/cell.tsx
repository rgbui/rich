import { BlockView } from "../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { ChildsArea } from "../../src/block/view/appear";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { Block } from "../../src/block";
import { ActionDirective } from "../../src/history/declare";
import { BlockUrlConstant } from "../../src/block/constant";
import { useSelectMenuItem } from "../../component/view/menu";
import { Point } from "../../src/common/vector/point";
import { TableRow } from "./row";
import { MenuItemType } from "../../component/view/menu/declare";
import lodash from "lodash";
import { ArrowDownSvg, ArrowLeftSvg, ArrowRightSvg, ArrowUpSvg, BlockcolorSvg, ClearCellSvg, CloseTickSvg, DeleteColSvg, DeleteRowSvg, TrashSvg } from "../../component/svgs";
import { BackgroundColorList, FontColorList } from "../../extensions/color/data";
import { GridMap } from "../../src/page/grid";
import { lst } from "../../i18n/store";

@url('/table/cell')
export class TableCell extends Block {
    @prop()
    rowspan: number = 1;
    @prop()
    colspan: number = 1;
    display = BlockDisplay.block;
    partName = 'cell';
    get isCell() {
        return true;
    }
    get row() {
        return this.parent as TableRow;
    }
    init() {
        this.gridMap = new GridMap(this)
    }
    get handleBlock() {
        return this.row.table;
    }
    async getHtml() {
        return `<td>${await this.getChildsHtml()}</td>`
    }
    async getChildsHtml() {
        return (await this.childs.asyncMap(async b => { return await b.getHtml() })).join("");
    }
    async getMd() {
        return await this.getChildsMd();
    }
    async getChildsMd() {
        return (await this.childs.asyncMap(async cm => {
            return await cm.getMd()
        })).join("")
    }
}

@view('/table/cell')
export class TableCellView extends BlockView<TableCell>{
    async mousedown(event: React.MouseEvent) {
        if (event.button == 2) return;
        if (this.block.childs.length == 0) {
            event.stopPropagation()
            await this.block.page.onAction(ActionDirective.onCreateBlockByEnter, async () => {
                var newBlock = await this.block.page.createBlock(BlockUrlConstant.TextSpan, {}, this.block);
                newBlock.mounted(() => {
                    this.block.page.kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
                })
            });
        }
    }
    async onContextMenu(event: React.MouseEvent<HTMLTableDataCellElement, MouseEvent>) {
        event.preventDefault();
        event.stopPropagation();
        try {
            function getColors(name?: string, options?: { font: string, fill: string }) {
                if (!name) name = '';
                else name = name + '-'
                return [
                    {
                        text: lst('文字颜色'),
                        type: MenuItemType.text
                    },
                    {
                        name: name + 'fontColor',
                        type: MenuItemType.color,
                        options: FontColorList().map(f => {
                            return {
                                text: f.text,
                                overlay: f.text,
                                value: f.color,
                                checked: options?.font == f.color ? true : false
                            }
                        })
                    },
                    {
                        type: MenuItemType.divide
                    },
                    {
                        text: lst('背景颜色'),
                        type: MenuItemType.text
                    },
                    {
                        type: MenuItemType.color,
                        name: name + 'fillColor',
                        options: BackgroundColorList().map(f => {
                            return {
                                text: f.text,
                                value: f.color,
                                checked: options?.fill == f.color ? true : false
                            }
                        })
                    },
                ]
            }
            var items = [
                { icon: ArrowUpSvg, text: lst('在上方插入一行'), name: 'up' },
                { icon: ArrowDownSvg, text: lst('在下方插入一行'), name: 'down' },
                { icon: ArrowLeftSvg, text: lst('在左边插入一列'), name: 'left' },
                { icon: ArrowRightSvg, text: lst('在右侧插入一列'), name: 'right' },
                { type: MenuItemType.divide },
                {
                    text: lst('所在行颜色'),
                    icon: BlockcolorSvg,
                    childs: getColors('row', {
                        font: this.block.parent?.pattern?.getFontStyle()?.color,
                        fill: this.block.parent?.pattern?.getFillStyle()?.color
                    })
                },
                {
                    text: lst('所在列颜色'),
                    icon: BlockcolorSvg,
                    childs: getColors('col', {
                        font: this.block?.pattern?.getFontStyle()?.color,
                        fill: this.block?.pattern?.getFillStyle()?.color
                    })
                },
                { type: MenuItemType.divide },
                { name: 'delRow', icon: DeleteRowSvg, text: lst('删除所在行'), },
                { name: 'delCol', icon: DeleteColSvg, text: lst('删除所在列') },
                { type: MenuItemType.divide },
                { icon: ClearCellSvg, text: lst('清空单元格'), name: 'clear' },
                {
                    text: lst('单元格颜色'),
                    icon: BlockcolorSvg,
                    childs: getColors(undefined, {
                        font: this.block.pattern?.getFontStyle()?.color,
                        fill: this.block.pattern?.getFillStyle()?.color
                    })
                },
            ]
            var result = await useSelectMenuItem({ roundPoint: Point.from(event).move(10, 10) },
                items
            );
            if (result) {
                switch (result.item.name) {
                    case 'left':
                        this.block.page.onAction('table.' + result.item.name, async () => {
                            var at = this.block.at;
                            var table = this.block.row.table;
                            var cs = lodash.cloneDeep(table.cols);
                            cs.splice(at, 0, { width: 250 });
                            await table.updateProps({ cols: cs }, BlockRenderRange.self);
                            await table.childs.eachAsync(async (row) => {
                                await row.page.createBlock('/table/cell', {}, row, at);
                            })
                        });
                        break;
                    case 'right':
                        this.block.page.onAction('table.' + result.item.name, async () => {
                            var at = this.block.at;
                            var table = this.block.row.table;
                            var cs = lodash.cloneDeep(table.cols);
                            cs.splice(at + 1, 0, { width: 250 });
                            await table.updateProps({ cols: cs }, BlockRenderRange.self);
                            await table.childs.eachAsync(async (row) => {
                                await row.page.createBlock('/table/cell', {}, row, at + 1);
                            })
                        });
                        break;
                    case 'up':
                        this.block.page.onAction('table.' + result.item.name, async () => {
                            var at = this.block.row.at;
                            var cs = this.block.row.table.cols.map(c => {
                                return {
                                    url: '/table/cell'
                                }
                            })
                            await this.block.page.createBlock('/table/row', { blocks: { childs: cs } }, this.block.row.table, at);
                        });
                        break;
                    case 'down':
                        this.block.page.onAction('table.' + result.item.name, async () => {
                            var at = this.block.row.at;
                            var cs = this.block.row.table.cols.map(c => {
                                return {
                                    url: '/table/cell'
                                }
                            })
                            await this.block.page.createBlock('/table/row', { blocks: { childs: cs } }, this.block.row.table, at + 1);
                        });
                        break;
                    case 'delRow':
                        this.block.page.onAction('table.' + result.item.name, async () => {
                            await this.block.row.delete()
                        })
                        break;
                    case 'delCol':
                        this.block.row.table.onRemoveColumn(this.block.at);
                        break;
                    case 'clear':
                        this.block.page.onAction('table.' + result.item.name, async () => {
                            var cs = this.block.childs.map(c => c);
                            await cs.eachAsync(async (c) => await c.delete())
                        })
                        break;
                    case 'fontColor':
                        this.block.page.onAction('setFontStyle', async () => {
                            this.block.pattern.setFontStyle({ color: result.item.value });
                        })
                        break;
                    case 'fillColor':
                        this.block.page.onAction('setFillStyle', async () => {
                            this.block.pattern.setFillStyle({ mode: 'color', color: result.item.value })
                        })
                        break;
                    case 'row-fontColor':
                        this.block.page.onAction('setFontStyle', async () => {
                            await this.block.parent.blocks.childs.eachAsync(async c => {
                                c.pattern.setFontStyle({ color: result.item.value })
                            })
                        })
                        break;
                    case 'row-fillColor':
                        this.block.page.onAction('setFillStyle', async () => {
                            await this.block.parent.blocks.childs.eachAsync(async c => {
                                c.pattern.setFillStyle({ mode: 'color', color: result.item.value })
                            })
                        })
                        break;
                    case 'col-fontColor':
                        var at = this.block.at;
                        this.block.page.onAction('setFontStyle', async () => {
                            this.block.parent.parent.childs.forEach(row => {
                                row.childs[at].pattern.setFontStyle({ color: result.item.value });
                            })
                        })
                        break;
                    case 'col-fillColor':
                        var at = this.block.at;
                        this.block.page.onAction('setFillStyle', async () => {
                            this.block.parent.parent.childs.forEach(row => {
                                row.childs[at].pattern.setFillStyle({ mode: 'color', color: result.item.value })
                            })
                        })
                        break;
                }
            }
        }
        catch (ex) {
            console.error(ex);
            this.block.page.onError(ex);
        }
    }
    renderView() {

        var style = this.block.pattern.style;
        return <td style={style}
            onMouseDown={e => this.mousedown(e)}
            onContextMenu={e => this.onContextMenu(e)}
            rowSpan={this.block.rowspan == 1 ? undefined : this.block.rowspan}
            colSpan={this.block.colspan == 1 ? undefined : this.block.colspan}
            ref={e => this.block.childsEl = e}
        >
            {this.block.childs.length == 0 && <div style={{ height: 20 }}></div>}
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </td>
    }
}