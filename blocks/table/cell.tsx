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
import { MenuItemTypeValue } from "../../component/view/menu/declare";
import lodash from "lodash";

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
}
@view('/table/cell')
export class TableCellView extends BlockView<TableCell>{
    async mousedown(event: React.MouseEvent) {
        if (this.block.childs.length == 0) {
            event.stopPropagation()
            await this.block.onAction(ActionDirective.onCreateBlockByEnter, async () => {
                var newBlock = await this.block.page.createBlock(BlockUrlConstant.TextSpan, {}, this.block);
                newBlock.mounted(()=>{
                    this.block.page.kit.writer.onFocusBlockAnchor(newBlock);
                })
            });
        }
    }
    async onContextMenu(event: React.MouseEvent<HTMLTableDataCellElement, MouseEvent>) {
        event.preventDefault();
        event.stopPropagation();
        var result = await useSelectMenuItem({ roundPoint: Point.from(event) },
            [
                {
                    text: '插入',
                    childs: [
                        { text: '左侧插入列', name: 'left' },
                        { text: '右侧插入列', name: 'right' },
                        { type: MenuItemTypeValue.divide },
                        { text: '上面插入行', name: 'up' },
                        { text: '下面插入行', name: 'down' }
                    ]
                },
                { text: '删除', childs: [{ text: '删除所在行', name: 'delRow' }, { name: 'delCol', text: '删除所在列' }] },
                { text: '清空', name: 'clear' }
            ]
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
                    this.block.page.onAction('table.' + result.item.name, async () => {
                        var at = this.block.at;
                        var rows = this.block.row.table.childs;
                        await rows.eachReverseAsync(async (row) => {
                            await row.childs[at].delete()
                        })
                    })
                    break;
                case 'clear':
                    this.block.page.onAction('table.' + result.item.name, async () => {
                        var cs = this.block.childs.map(c => c);
                        await cs.eachAsync(async (c) => await c.delete())
                    })
                    break;
            }
        }
    }
    render() {
        var style: Record<string, any> = {

        };
        return <td style={style}
            onMouseDown={e => this.mousedown(e)}
            onContextMenu={e => this.onContextMenu(e)}
            rowSpan={this.block.rowspan == 1 ? undefined : this.block.rowspan}
            colSpan={this.block.colspan == 1 ? undefined : this.block.colspan}
            ref={e => this.block.childsEl = e}
        ><ChildsArea childs={this.block.childs}></ChildsArea></td>
    }
}