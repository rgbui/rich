import { Block } from "../../../src/block";
import { BlockView } from "../../../src/block/view";
import React, { CSSProperties } from "react";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { ChildsArea } from "../../../src/block/view/appear";
import { ActionDirective } from "../../../src/history/declare";
import { Point, Rect } from "../../../src/common/vector/point";
import lodash from 'lodash';
import { MouseDragger } from "../../../src/common/dragger";
import { DragHandleSvg, PlusSvg, TableBottomInsertSvg, TableClearCellSvg, TableDeleteColSvg, TableDeleteRowSvg, TableLeftInsertSvg, TableRightInsertSvg, TableTopInsertSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { ghostView } from "../../../src/common/ghost";
import { ToolTip } from "../../../component/view/tooltip";
import { S } from "../../../i18n/view";
import { BoardBlockSelector, BoardPointType } from "../../../src/block/partial/board";
import { BoardDrag } from "../../../src/kit/operator/board";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { FontColorList, BackgroundColorList } from "../../../extensions/color/data";
import { ls, lst } from "../../../i18n/store";
import { BlockUrlConstant } from "../../../src/block/constant";
import "./style.less";

const COL_WIDTH = 150;
const CELL_HEIGHT = 30;

@url('/table')
export class Table extends Block {
    display = BlockDisplay.block;
    @prop()
    cols: { width: number }[] = [];
    async created() {
        if (this.cols.length == 0) {
            await this.updateProps({ cols: [{ width: COL_WIDTH }, { width: COL_WIDTH }] });
            await this.page.createBlock('/table/row',
                { blocks: { childs: [{ url: '/table/cell' }, { url: '/table/cell' }] } },
                this);
            await this.page.createBlock('/table/row',
                { blocks: { childs: [{ url: '/table/cell' }, { url: '/table/cell' }] } },
                this);
            await this.page.createBlock('/table/row',
                { blocks: { childs: [{ url: '/table/cell' }, { url: '/table/cell' }] } },
                this);
        }
    }
    async didMounted() {
        if (this.childs.length == 0) {
            await this.page.onAction(ActionDirective.onErrorRepairDidMounte, async () => {
                await this.updateProps({ cols: [{ width: COL_WIDTH }] });
                await this.page.createBlock('/table/row',
                    { blocks: { childs: [{ url: '/table/cell' }] } },
                    this);
                await this.page.createBlock('/table/row',
                    { blocks: { childs: [{ url: '/table/cell' }] } },
                    this);
                await this.page.createBlock('/table/row',
                    { blocks: { childs: [{ url: '/table/cell' }] } },
                    this);
            })
        }
    }
    async onAddRow(at?: number, arrow?: 'down' | 'up', isMerge?: boolean) {
        if (typeof at == 'undefined') at = this.childs.length;
        if (typeof arrow == 'undefined') arrow = 'up';
        await this.page.onAction('onAddRow', async () => {
            var cs = this.cols.map(c => {
                return {
                    url: '/table/cell'
                }
            })
            await this.page.createBlock('/table/row', { blocks: { childs: cs } }, this, at + (arrow == 'down' ? 1 : 0));
            if (isMerge) this.page.snapshoot.merge();
        });
    }
    async onAddColumn(at?: number, arrow?: 'left' | 'right', isMerge?: boolean) {
        if (typeof at == 'undefined') at = this.cols.length;
        if (typeof arrow == 'undefined') arrow = 'left';
        await this.page.onAction('onAddRow', async () => {
            var cs = lodash.cloneDeep(this.cols);
            cs.splice(at + (arrow == 'right' ? 1 : 0), 0, { width: COL_WIDTH });
            await this.updateProps({ cols: cs }, BlockRenderRange.self);
            await this.childs.eachAsync(async (row) => {
                await row.page.createBlock('/table/cell', {}, row, at + (arrow == 'right' ? 1 : 0));
            });
            if (isMerge) this.page.snapshoot.merge()
        });
    }
    async onDragAdd(options: { save?: boolean, row: number, column: number, newRow: number, newColumn: number }) {
        await this.page.onAction('onDragAdd', async () => {
            this.page.snapshoot.pause();
            var ds: Block[] = [];
            await this.childs.eachReverseAsync(async (b, r) => {
                await b.childs.eachReverseAsync(async (g, c) => {
                    if (c >= options.column) ds.push(g);
                });
                if (r >= options.row) ds.push(b)
            });
            await ds.eachAsync(async b => await b.delete());
            if (this.cols.length < options.column) {
                for (let c = this.cols.length; c < options.column; c++) {
                    this.cols.push({ width: COL_WIDTH })
                }
            }
            else if (this.cols.length > options.column) {
                this.cols.splice(options.column, this.cols.length - options.column);
            }
            await this.childs.eachAsync(async row => {
                if (row.childs.length < options.column) {
                    for (let i = row.childs.length; i < options.column; i++) {
                        await row.page.createBlock('/table/cell', {}, row, i);
                    }
                }
            });
            if (this.childs.length < options.row) {
                for (let m = this.childs.length; m < options.row; m++) {
                    var cs = this.cols.map(c => {
                        return {
                            url: '/table/cell'
                        }
                    })
                    await this.page.createBlock('/table/row', { blocks: { childs: cs } }, this, m);
                }
            }
            /**
             * 做一些清理的准备
             */
            this.page.snapshoot.start();
            /**
             * 判断是否保存
             */
            if (options.save !== true) this.page.snapshoot.pause();
            var rs: Block[] = [];
            await this.childs.eachAsync(async (b, r) => {
                await b.childs.eachAsync(async (g, c) => {
                    if (c >= options.newColumn) rs.push(g);
                });
                if (r >= options.newRow) rs.push(b)
            });
            await rs.eachAsync(async b => await b.delete());
            var cols = lodash.cloneDeep(this.cols);
            if (cols.length < options.newColumn) {
                for (let c = cols.length; c < options.newColumn; c++) {
                    cols.push({ width: COL_WIDTH })
                }
            }
            else if (cols.length > options.newColumn) {
                cols.splice(options.newColumn, cols.length - options.newColumn);
            }
            await this.childs.eachAsync(async row => {
                if (row.childs.length < options.newColumn) {
                    for (let i = row.childs.length; i < options.newColumn; i++) {
                        await row.page.createBlock('/table/cell', {}, row, i);
                    }
                }
            });
            if (this.childs.length < options.newRow) {
                for (let m = this.childs.length; m < options.newRow; m++) {
                    var cs = cols.map(c => {
                        return {
                            url: '/table/cell'
                        }
                    })
                    await this.page.createBlock('/table/row', { blocks: { childs: cs } }, this, m);
                }
            };
            await this.manualUpdateProps({ cols: this.cols }, { cols }, BlockRenderRange.self);
        });
    }
    async onChangeRowIndex(rowIndx: number, newRowIndex: number) {
        await this.page.onAction('onChangeRowIndex', async () => {
            var row = this.childs[rowIndx];
            var newRow = this.childs[newRowIndex];
            if (newRow) await row.insertBefore(newRow);
            else await row.insertAfter(this.childs.last());
        });
    }
    async onChangeColumnIndex(columnIndex: number, newColumnIndex: number) {
        await this.page.onAction('onChangeColumnIndex', async () => {
            var cs = lodash.cloneDeep(this.cols);
            await this.childs.eachAsync(async row => {
                var c = row.childs[columnIndex];
                var nc = row.childs[newColumnIndex];
                if (nc) await c.insertBefore(nc)
                else await c.insertAfter(row.childs.last())
            });
            var oc = cs[columnIndex];
            var cc = cs[newColumnIndex];
            if (cc) {
                cs.remove(g => g === oc);
                var at = cs.findIndex(g => g == cc);
                cs.splice(at, 0, oc);
            }
            else {
                cs.remove(g => g === oc);
                cs.push(oc);
            }
            await this.manualUpdateProps({ cols: this.cols }, { cols: cs }, BlockRenderRange.self)
        });
    }
    async onRemoveColumn(columnIndex: number) {
        await this.page.onAction('table.columnIndex', async () => {
            var cs = lodash.cloneDeep(this.cols);
            cs.splice(columnIndex, 1);
            var rows = this.childs;
            await rows.eachReverseAsync(async (row) => {
                if (row.childs[columnIndex])
                    await row.childs[columnIndex].delete()
            });
            await this.manualUpdateProps({ cols: this.cols }, { cols: cs }, BlockRenderRange.self)
        })
    }
    async onColContextMenu(colIndex: number, event: React.MouseEvent | MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        try {
            function getColors(name?: string, options?: { font: string | { color: string, grad: string }, fill: string }) {
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
                                checked: lodash.isEqual(options?.font, f.color) ? true : false
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
                { icon: TableLeftInsertSvg, iconSize: 18, text: lst('在左边插入一列'), name: 'left' },
                { icon: TableRightInsertSvg, iconSize: 18, text: lst('在右侧插入一列'), name: 'right' },
                { type: MenuItemType.divide },
                {
                    text: lst('当前列颜色'),
                    icon: { name: 'byte', code: 'rectangle' } as any,
                    childs: getColors()
                },
                { type: MenuItemType.divide },
                { name: 'delCol', disabled: this.childs.first().childs.length > 0 ? false : true, icon: TableDeleteColSvg, text: lst('删除列') },
                { type: MenuItemType.divide },
                { icon: TableClearCellSvg, iconSize: 18, text: lst('清空单元格'), name: 'clear' }
            ]
            var result = await useSelectMenuItem({ roundPoint: Point.from(event).move(10, 10) },
                items
            );
            if (result) {
                switch (result.item.name) {
                    case 'left':
                        await this.page.onAction('table.' + result.item.name, async () => {
                            var at = colIndex;
                            var table = this;
                            var cs = lodash.cloneDeep(table.cols);
                            cs.splice(at, 0, { width: 250 });
                            await table.updateProps({ cols: cs }, BlockRenderRange.self);
                            await table.childs.eachAsync(async (row) => {
                                await row.page.createBlock('/table/cell', {}, row, at);
                            })
                        });
                        break;
                    case 'right':
                        await this.page.onAction('table.' + result.item.name, async () => {
                            var at = colIndex;
                            var table = this;
                            var cs = lodash.cloneDeep(table.cols);
                            cs.splice(at + 1, 0, { width: 250 });
                            await table.updateProps({ cols: cs }, BlockRenderRange.self);
                            await table.childs.eachAsync(async (row) => {
                                await row.page.createBlock('/table/cell', {}, row, at + 1);
                            })
                        });
                        break;
                    case 'delCol':
                        await this.onRemoveColumn(colIndex);
                        break;
                    case 'clear':
                        await this.page.onAction('table.' + result.item.name, async () => {
                            var cs = this.blocks.childs.map(c => c.childs[colIndex]);
                            cs = cs.filter(c => c.childs).flat(2);
                            await cs.eachAsync(async (c) => await c.delete())
                        })
                        break;
                    case 'fontColor':
                        await this.page.onAction('setFontStyle', async () => {
                            var cs = this.blocks.childs.map(c => c.childs[colIndex]);
                            await cs.eachAsync(async c => {
                                await c.pattern.setFontStyle({ color: result.item.value });
                            })
                        })
                        break;
                    case 'fillColor':
                        await this.page.onAction('setFillStyle', async () => {
                            var cs = this.blocks.childs.map(c => c.childs[colIndex]);
                            await cs.eachAsync(async c => {
                                await c.pattern.setFillStyle({ mode: 'color', color: result.item.value })
                            })
                        })
                        break;
                }
            }
        }
        catch (ex) {
            console.error(ex);
            this.page.onError(ex);
        }
    }
    async onRowContextmenu(rowIndex: number, event: React.MouseEvent | MouseEvent) {
        function getColors(name?: string, options?: { font: string | { color: string, grad: string }, fill: string }) {
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
                            checked: lodash.isEqual(options?.font, f.color) ? true : false
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
            { icon: TableTopInsertSvg, iconSize: 18, text: lst('在上方插入一行'), name: 'up' },
            { icon: TableBottomInsertSvg, iconSize: 18, text: lst('在下方插入一行'), name: 'down' },
            { type: MenuItemType.divide },
            {
                text: lst('当前行颜色'),
                icon: { name: 'byte', code: 'rectangle-one' } as any,
                childs: getColors()
            },
            { type: MenuItemType.divide },
            { name: 'delRow', disabled: this.childs.length > 1 ? false : true, icon: TableDeleteRowSvg, text: lst('删除行'), },
            { type: MenuItemType.divide },
            { icon: TableClearCellSvg, iconSize: 18, text: lst('清空单元格'), name: 'clear' }
        ]
        var result = await useSelectMenuItem({ roundPoint: Point.from(event).move(10, 10) },
            items
        );
        if (result) {
            switch (result.item.name) {
                case 'up':
                    await this.page.onAction('table.' + result.item.name, async () => {
                        var at = rowIndex;
                        var cs = this.cols.map(c => {
                            return {
                                url: '/table/cell'
                            }
                        })
                        await this.page.createBlock('/table/row', { blocks: { childs: cs } }, this, at);
                    });
                    break;
                case 'down':
                    await this.page.onAction('table.' + result.item.name, async () => {
                        var at = rowIndex;
                        var cs = this.cols.map(c => {
                            return {
                                url: '/table/cell'
                            }
                        })
                        await this.page.createBlock('/table/row', { blocks: { childs: cs } }, this, at + 1);
                    });
                    break;
                case 'delRow':
                    await this.page.onAction('table.' + result.item.name, async () => {
                        await this.childs[rowIndex].delete()
                    })
                    break;
                case 'clear':
                    await this.page.onAction('table.' + result.item.name, async () => {
                        var cs = this.childs[rowIndex].childs.map(c => c.childs).flat(2);
                        await cs.eachAsync(async (c) => await c.delete())
                    })
                    break;
                case 'fontColor':
                    await this.page.onAction('setFontStyle', async () => {
                        var cs = this.childs[rowIndex].childs;
                        await cs.eachAsync(async c => {
                            await c.pattern.setFontStyle({ color: result.item.value });
                        })
                    })
                    break;
                case 'fillColor':
                    await this.page.onAction('setFillStyle', async () => {
                        var cs = this.childs[rowIndex].childs;
                        await cs.eachAsync(async c => {
                            await c.pattern.setFillStyle({ mode: 'color', color: result.item.value })
                        })
                    })
                    break;
            }
        }
    }
    async getHtml() {
        return `<table>
<tbody>${await this.getChildsHtml()}</tbody>
</table>`
    }
    async getChildsHtml() {
        return (await this.childs.asyncMap(async b => { return await b.getHtml() })).join("\n");
    }
    async getMd() {
        return await this.getChildsMd();
    }
    async getChildsMd() {
        var cs = this.childs;
        var ps: string[] = [];
        ps.push(await this.childs[0].getMd())
        ps.push('|' + this.childs[0].childs.map(c => '---').join("|") + '|')
        for (let i = 1; i < cs.length; i++) {
            ps.push(await this.childs[i].getMd())
        }
        return ps.join("\n");
    }
    getBlockBoardSelector(this: Block, types?: BoardPointType[]): BoardBlockSelector[] {
        // var pickers = super.getBlockBoardSelector([BoardPointType.path]);
        // lodash.remove(pickers, c => c.type == BoardPointType.rotatePort)
        // return pickers
        return []
    }
    get visibleStyle() {
        var style = super.visibleStyle;
        return style;
    }
    get fixedSize(): { width: number; height: number; } {
        if (this.el) {
            return {
                width: this.el.offsetWidth,
                height: this.el.offsetHeight
            }
        }
        else {
            return {
                width: this.fixedWidth,
                height: this.fixedHeight
            }
        }
    }
    @prop()
    lineType: 'solid' | 'dashed' | 'double' | 'dotted' = 'solid';
    @prop()
    lineColor: string = '#ddd';
    @prop()
    lineWidth = 1;
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var c = rs.findIndex(c => c.name == 'color');
        if (c > -1) {
            rs.splice(c, 2);
        }
        var borderItems = [];
        borderItems.push({
            text: lst('线类型'),
            icon: { name: 'bytedance-icon', code: 'align-text-both' },
            childs: [
                {
                    name: 'lineType',
                    text: lst('实线'),
                    value: 'solid',
                    checkLabel: this.lineType == 'solid'
                },
                {
                    name: 'lineType',
                    text: lst('虚线'),
                    value: 'dashed',
                    checkLabel: this.lineType == 'dashed'
                },
                {
                    name: 'lineType',
                    text: lst('双线'),
                    value: 'double',
                    checkLabel: this.lineType == 'double'
                },
                {
                    name: 'lineType',
                    text: lst('点状虚线'),
                    value: 'dotted',
                    checkLabel: this.lineType == 'dotted'
                }
            ]
        });
        borderItems.push({
            text: lst('线宽'),
            icon: { name: 'bytedance-icon', code: 'auto-height-one', rotate: 90, },
            childs: [
                {
                    name: 'lineWidth',
                    text: '1',
                    value: 1,
                    checkLabel: this.lineWidth == 1
                },
                {
                    name: 'lineWidth',
                    text: '2',
                    value: 2,
                    checkLabel: this.lineWidth == 2
                },
                {
                    name: 'lineWidth',
                    text: '4',
                    value: 4,
                    checkLabel: this.lineWidth == 4
                },
                {
                    name: 'lineWidth',
                    text: '8',
                    value: 8,
                    checkLabel: this.lineWidth == 8
                },
                {
                    name: 'lineWidth',
                    text: '16',
                    value: 16,
                    checkLabel: this.lineWidth == 16
                }
            ]
        });
        borderItems.push({ type: MenuItemType.divide });
        borderItems.push({
            text: lst('线颜色'),
            type: MenuItemType.text
        })
        borderItems.push({ type: MenuItemType.gap })
        borderItems.push({
            name: 'lineColor',
            type: MenuItemType.color,
            block: ls.isCn ? false : true,
            options: [
                { color: 'inherit', text: lst('默认') },
                { color: 'rgba(55,53,47,0.2)', text: lst('浅灰') },
                { color: 'rgba(55,53,47,0.6)', text: lst('灰色') },
                { color: 'rgb(100,71,58)', text: lst('棕色') },
                { color: 'rgb(217,115,13)', text: lst('橙色') },
                { color: 'rgb(223,171,1)', text: lst('黄色') },
                { color: 'rgb(15,123,108)', text: lst('绿色') },
                { color: 'rgb(11,110,153)', text: lst('蓝色') },
                { color: 'rgb(105,64,165)', text: lst('紫色') },
                { color: 'rgb(173,26,114)', text: lst('粉色') },
                { color: 'rgb(224,62,62)', text: lst('红色') },
            ].map(f => {
                return {
                    text: f.text,
                    overlay: f.text,
                    value: f.color,
                    checked: this.lineColor == f.color ? true : false
                }
            })
        })
        var dat = rs.findIndex(c => c.name == BlockDirective.comment);
        rs.splice(dat - 1, 0, { type: MenuItemType.divide }, {
            text: lst('表格操作'),
            icon: { name: 'byte', code: 'write' },
            childs: [
                { icon: TableLeftInsertSvg, iconSize: 18, text: lst('在左边插入一列'), name: 'left' },
                { icon: TableRightInsertSvg, iconSize: 18, text: lst('在右侧插入一列'), name: 'right' },
                { icon: TableTopInsertSvg, iconSize: 18, text: lst('在上方插入一行'), name: 'up' },
                { icon: TableBottomInsertSvg, iconSize: 18, text: lst('在下方插入一行'), name: 'down' },
                { type: MenuItemType.divide },
                { icon: TableClearCellSvg, iconSize: 18, text: lst('清空单元格内容'), name: 'clearAll' }
            ]
        },
            {
                text: lst('边框'),
                childs: borderItems,
                icon: {
                    name: 'byte',
                    code: 'rectangle-one'
                }
            },
            {

                text: lst('均分列宽'),
                name: 'agvCols',
                icon: { name: 'byte', code: 'horizontal-tidy-up' }
            },
            {
                text: lst('行列转换'),
                name: 'rowColTurn',
                icon: { name: 'bytedance-icon', code: 'pivot-table' }
            }
        )
        dat = rs.findIndex(c => c.name == BlockDirective.delete);
        if (dat > -1) {
            rs.splice(dat + 1, 0, { type: MenuItemType.divide }, {
                type: MenuItemType.help,
                text: lst('了解如何使用简单表格'),
                url: window.shyConfig?.isUS ? "https://help.shy.live/page/257" : "https://help.shy.live/page/257"
            })
        }
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent): Promise<void> {
        if (item.name == 'lineType' || item.name == 'lineWidth' || item.name == 'lineColor') {
            await this.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self })
            return;
        }
        else if (item.name == 'clearAll') {
            await this.page.onAction('clearAll', async () => {
                await this.childs.eachAsync(async row => {
                    await row.childs.eachAsync(async cell => {
                        await cell.childs.eachReverseAsync(async c => await c.delete())
                    })
                })
            })
            return;
        }
        else if (item.name == 'agvCols') {
            await this.page.onAction('agvCols', async () => {
                var width = this.cols.sum(c => c.width);
                var w = width / this.cols.length;
                await this.updateProps({
                    cols: this.cols.map(c => {
                        return {
                            width: w
                        }
                    })
                }, BlockRenderRange.self)
            })
            return;
        }
        else if (item.name == 'rowColTurn') {
            await this.page.onAction('rowColTurn', async () => {
                var t = {
                    url: BlockUrlConstant.Table,
                    cols: [],
                    lineColor: this.lineColor,
                    lineWidth: this.lineWidth,
                    lineType: this.lineType,
                    blocks: {
                        childs: []
                    }
                }
                for (let i = 0; i < this.cols.length; i++) {
                    var row = { url: BlockUrlConstant.TableRow, blocks: { childs: [] } };
                    for (let j = 0; j < this.childs.length; j++) {
                        row.blocks.childs.push(await this.childs[j].childs[i].cloneData());
                        if (i == 0) {
                            t.cols.push({
                                width: COL_WIDTH
                            })
                        }
                    }
                    t.blocks.childs.push(row);
                };
                var newTable = await this.replaceDatas([t]);
            })
            return;
        }
        return await super.onClickContextMenu(item, event);
    }
    getVisibleHandleCursorPoint(): Point {
        if (!this.el) return
        var c = this.el.querySelector('.sy-block-table-box') as HTMLElement;
        if (!c) return
        var r = Rect.fromEle(c);
        var p = r.leftTop;
        p = p.move(-5, 8);
        return p;
    }
}

@view('/table')
export class TableView extends BlockView<Table>{
    mousemove(event: MouseEvent) {
        if (!this.block.isCanEdit()) return;
        if (this.isMoveLine) return;
        var boxRect = Rect.fromEle(this.box);
        var tableRect = Rect.fromEle(this.table);
        var firstTr = this.table.querySelector('tr');
        if (!firstTr) return;
        var tds = Array.from(firstTr.children) as HTMLElement[];
        var scrollLeft = this.box.scrollLeft;
        var tableLeft = boxRect.left - scrollLeft;
        var w = 0;
        var gap = 5;
        var index = -1;
        for (let i = 0; i < tds.length; i++) {
            var col = tds[i];
            var colRect = Rect.fromEle(col);
            w += colRect.width;
            var bw = tableLeft + w;
            if (bw - gap < event.clientX && event.clientX < bw + gap) {
                index = i;
                break;
            }
        }

        if (index > -1) {
            this.subline.style.display = 'block';
            this.subline.style.left = (w - scrollLeft + 1) + 'px';
            this.subline.style.height = tableRect.height + 'px';
            this.subline.setAttribute('data-index', index.toString());
        }
        else {
            this.subline.style.display = 'none';
        }
        if (
            event.clientY >= tableRect.top && event.clientY <= tableRect.bottom
            &&
            event.clientX >= tableRect.right && event.clientX <= tableRect.right + 20
        ) {
            this.rightPlus.style.display = 'flex';
            this.rightPlus.style.left = (tableRect.width + 5) + 'px';
            this.rightPlus.style.height = tableRect.height + 'px';
        }
        else {
            this.rightPlus.style.display = 'none';
        }
        if (
            event.clientY >= tableRect.bottom && event.clientY <= tableRect.bottom + 20
            &&
            event.clientX >= tableRect.left && event.clientX <= tableRect.right
        ) {
            this.bottomPlus.style.display = 'flex';
            this.bottomPlus.style.top = (tableRect.height + 5) + 'px';
            this.bottomPlus.style.width = tableRect.width + 'px';
        }
        else {
            this.bottomPlus.style.display = 'none';
        }
        if (
            event.clientY >= tableRect.bottom && event.clientY <= tableRect.bottom + 20
            &&
            event.clientX >= tableRect.right && event.clientX <= tableRect.right + 20
        ) {
            this.resizePlus.style.display = 'flex';
            this.resizePlus.style.top = (tableRect.height + 5) + 'px';
            this.resizePlus.style.left = (tableRect.width + 5) + 'px';
        }
        else {
            this.resizePlus.style.display = 'none';
        }
        var isShowDragRow: boolean = false;
        var trs = Array.from(this.table.querySelector('tbody').children);
        for (let s = 0; s < trs.length; s++) {
            var tr = trs[s] as HTMLElement;
            var trRect = Rect.fromEle(tr);
            if (event.clientY >= trRect.top && event.clientY <= trRect.bottom) {
                var td = tr.children[0];
                var tdRect = Rect.fromEle(td as HTMLElement);
                if (event.clientX <= tableLeft + tdRect.width) {
                    var trRect = Rect.fromEle(tr);
                    this.leftDrag.style.display = 'flex';
                    this.leftDrag.style.top = (trRect.top - boxRect.top) + 'px';
                    this.leftDrag.style.height = trRect.height + 'px';
                    this.leftDrag.setAttribute('data-index', s.toString());
                    isShowDragRow = true;
                }
                break;
            }
        }
        if (!isShowDragRow) {
            this.leftDrag.style.display = 'none';
        }
        var isShowDragColumn: boolean = false;
        var cw = tableLeft + 0;
        var firstRow = trs[0];
        var firstRowRect = Rect.fromEle(firstRow as HTMLElement);
        if (event.clientY <= firstRowRect.bottom) {
            for (let i = 0; i < tds.length; i++) {
                var tdRect = Rect.fromEle(tds[i]);
                if (event.clientX > cw && event.clientX <= cw + tdRect.width) {
                    this.topDrag.style.display = 'flex';
                    this.topDrag.style.left = (cw - tableLeft - scrollLeft) + 'px';
                    this.topDrag.style.width = tdRect.width + 'px';
                    this.topDrag.setAttribute('data-index', i.toString());
                    isShowDragColumn = true;
                    break;
                }
                cw += tdRect.width;
            }
        }
        if (!isShowDragColumn) {
            this.topDrag.style.display = 'none';
        }
        if (this.tableOperator)
            this.tableOperator.style.display = 'flex';
    }
    onMousedownLine(event: React.MouseEvent) {
        this.topDrag.style.display = 'none';
        this.leftDrag.style.display = 'none';
        this.bottomPlus.style.display = 'none';
        this.rightPlus.style.display = 'none';
        this.resizePlus.style.display = 'none';
        var self = this;
        self.isMoveLine = true;
        event.stopPropagation();
        var firstRow = this.table.querySelector('tr');
        var tds = Array.from(firstRow.children);
        var gm = this.block.globalWindowMatrix;
        var s = gm.getScaling().x;
        var p = gm.inverseTransform(Point.from(event));
        var scrollLeft = this.box.scrollLeft;
        MouseDragger<{ colIndex: number, colWidth: number, colEle: HTMLElement }>({
            event,
            cursor: 'col-resize',
            moveStart: (ev, data) => {
                data.colIndex = parseInt(self.subline.getAttribute('data-index'));
                data.colEle = self.table.querySelector('colgroup').children[data.colIndex] as HTMLElement;
                var tdRect = Rect.fromEle(tds[data.colIndex] as HTMLElement)
                data.colWidth = tdRect.width;
                self.isMoveLine = true;
            },
            moving: (ev, data, isend, isM) => {
                if (!isM) return;
                self.isMoveLine = true;
                var ed = gm.inverseTransform(Point.from(ev));
                var dx = ed.x - p.x;
                var w = dx + data.colWidth;
                w = Math.max(w, 20);
                data.colEle.style.width = (w / s) + 'px';
                data.colEle.style.minWidth = (w / s) + 'px';
                var tdRect = Rect.fromEle(tds[data.colIndex] as HTMLElement)
                w = tdRect.width;
                var left = self.block.cols.findAll((g, i) => i < data.colIndex).sum(g => g.width) * s + (w) + 1;
                self.subline.style.left = ((left - scrollLeft)) + 'px';
                var tableRect = Rect.fromEle(self.table);
                self.subline.style.height = (tableRect.height) + 'px';
                if (isend) {
                    var cols = lodash.cloneDeep(self.block.cols);
                    var col = cols[data.colIndex];
                    col.width = w / s;
                    self.block.onUpdateProps({ cols }, { range: BlockRenderRange.self })
                }
            },
            moveEnd() {
                self.isMoveLine = false;
            }
        })
    }
    onMousedownResize(event: React.MouseEvent, resize: 'right' | 'bottom' | 'resize') {
        var self = this;
        self.isMoveLine = true;
        var tableRect = Rect.fromEle(this.table);
        event.stopPropagation();
        var rowCount = this.block.childs.length;
        var columnCount = this.block.cols.length;
        var endEmptyRowCount = 0;
        var endEmptyColumnCount = 0;
        for (let i = this.block.childs.length - 1; i > 0; i--) {
            if (this.block.childs[i].childs.every(g => g.childs.length == 0)) {
                endEmptyRowCount += 1;
            }
            else break;
        }
        for (let c = this.block.cols.length - 1; c > 0; c--) {
            var cs = this.block.childs.map(g => g.childs[c]);
            if (cs.every(c => c.childs.length == 0)) endEmptyColumnCount += 1;
            else break;
        }
        var top: number, left: number;
        if (resize == 'resize') {
            top = parseInt(this.resizePlus.style.top.replace('px', ''));
            left = parseInt(this.resizePlus.style.left.replace('px', ''));
        }
        else {
            top = parseInt(this.bottomPlus.style.top.replace('px', ''));
            left = parseInt(this.rightPlus.style.left.replace('px', ''));
        }
        var rdata: string = '';
        MouseDragger({
            event,
            cursor: 'col-resize',
            moveStart: (ev, data) => {

            },
            move: async (ev, data) => {
                var rc = rowCount;
                var rx = columnCount;
                if (resize == 'bottom') {

                    var dy = ev.clientY - event.clientY;
                    rc = rowCount + Math.ceil(dy / CELL_HEIGHT);
                    if (rc < rowCount - endEmptyRowCount) rc = rowCount - endEmptyRowCount;
                    this.bottomPlus.style.top = (top + (rc - rowCount) * CELL_HEIGHT) + 'px';
                }
                if (resize == 'right') {
                    var dx = ev.clientX - event.clientX;
                    rx = columnCount + Math.ceil(dx / COL_WIDTH);
                    if (rx < columnCount - endEmptyColumnCount) rx = columnCount - endEmptyColumnCount;
                    this.rightPlus.style.left = (left + (rx - columnCount) * COL_WIDTH) + 'px';
                }
                if (resize == 'resize') {

                    var dy = ev.clientY - event.clientY;
                    rc = rowCount + Math.ceil(dy / CELL_HEIGHT);
                    this.resizePlus.style.top = (ev.clientY - tableRect.top) + 'px';
                    if (rc < rowCount - endEmptyRowCount) rc = rowCount - endEmptyRowCount;
                    this.resizePlus.style.top = (top + (rc - rowCount) * CELL_HEIGHT) + 'px';

                    this.resizePlus.style.left = (ev.clientX - tableRect.left) + 'px';
                    var dx = ev.clientX - event.clientX;
                    rx = columnCount + Math.ceil(dx / COL_WIDTH);
                    if (rx < columnCount - endEmptyColumnCount) rx = columnCount - endEmptyColumnCount;
                    this.resizePlus.style.left = (left + (rx - columnCount) * COL_WIDTH) + 'px';
                }
                var args = {
                    row: rowCount,
                    column: columnCount,
                    newRow: rc,
                    newColumn: rx
                }
                if (JSON.stringify(args) == rdata) return;
                rdata = JSON.stringify(args);
                this.block.onDragAdd(args);
            },
            moveEnd: async (ev, isMove) => {
                self.isMoveLine = false;
                rdata = '';
                if (isMove) {
                    var rc = rowCount;
                    var rx = columnCount;
                    if (resize == 'bottom') {
                        var dy = ev.clientY - event.clientY;
                        rc = rowCount + Math.ceil(dy / CELL_HEIGHT);
                        if (rc < rowCount - endEmptyRowCount) rc = rowCount - endEmptyRowCount;
                    }
                    if (resize == 'right') {
                        var dx = ev.clientX - event.clientX;
                        rx = columnCount + Math.ceil(dx / COL_WIDTH);
                        if (rx < columnCount - endEmptyColumnCount) rx = columnCount - endEmptyColumnCount;
                    }
                    if (resize == 'resize') {
                        var dy = ev.clientY - event.clientY;
                        rc = rowCount + Math.ceil(dy / CELL_HEIGHT);
                        if (rc < rowCount - endEmptyRowCount) rc = rowCount - endEmptyRowCount;

                        var dx = ev.clientX - event.clientX;
                        rx = columnCount + Math.ceil(dx / COL_WIDTH);
                        if (rx < columnCount - endEmptyColumnCount) rx = columnCount - endEmptyColumnCount;
                    }
                    await this.block.onDragAdd({
                        save: true,
                        row: rowCount,
                        column: columnCount,
                        newRow: rc,
                        newColumn: rx
                    });
                    self.bottomPlus.style.display = 'none';
                    self.rightPlus.style.display = 'none';
                    self.resizePlus.style.display = 'none';
                }
                else {
                    self.bottomPlus.style.display = 'none';
                    self.rightPlus.style.display = 'none';
                    self.resizePlus.style.display = 'none';
                    if (resize == 'bottom') {
                        await self.block.onAddRow();
                    }
                    else if (resize == 'right') {
                        await self.block.onAddColumn();
                    }
                    else if (resize == 'resize') {
                        await self.block.onAddColumn();
                        await self.block.onAddRow(undefined, undefined, true);
                    }
                }
            }
        })
    }
    onMousedownDrag(event: React.MouseEvent, arrow: 'top' | 'left') {
        var self = this;
        self.isMoveLine = true;
        event.stopPropagation();
        var boxRect = Rect.fromEle(this.box);
        var tableRect = Rect.fromEle(this.table);
        var firstTr = this.table.querySelector('tr');
        var tds = Array.from(firstTr.children) as HTMLElement[];
        var scrollLeft = this.box.scrollLeft;
        var tableLeft = boxRect.left - scrollLeft;
        if (arrow == 'top') {
            var colIndex = parseInt(self.topDrag.getAttribute('data-index'));
            var col = this.block.cols[colIndex];
            var trs = Array.from(this.table.querySelector('tbody').children);
            MouseDragger({
                event,
                moveStart: (ev, data) => {
                    var html = `${trs.map(tr => (tr.children[colIndex] as HTMLElement).outerHTML).map(c => `<tr>${c}</tr>`).join("")}`
                    html = `<div class='sy-block-table'><table>
                    <colgroup><col style='min-width:${col.width}px;width:${col.width}px'></col></colgroup>
                    <tbody>${html}</tbody></table></div>`
                    ghostView.load(html, { point: Point.from(event) });
                    self.topDrag.style.display = 'none';
                },
                moving: (ev, data, isend, isM) => {
                    if (isend) return;
                    if (!isM) return;
                    ghostView.move(Point.from(ev));
                    var w = 0;
                    var index = -1;
                    var isFind: boolean = false;
                    for (let i = 0; i < tds.length; i++) {
                        var col = tds[i];
                        var colRect = Rect.fromEle(col);
                        if (ev.clientX >= tableLeft + w && ev.clientX < tableLeft + w + colRect.width) {
                            if (ev.clientX > tableLeft + w + colRect.width / 2) {
                                this.subline.setAttribute('data-index', (i + 1).toString());
                                w += colRect.width;
                                index = i + 1;
                            }
                            else {
                                this.subline.setAttribute('data-index', i.toString());
                                index = i;
                            }
                            isFind = true;
                            break;
                        }
                        else w += colRect.width;
                    }
                    if (index > -1) {
                        this.subline.style.display = 'block';
                        this.subline.style.left = (w - scrollLeft + 1) + 'px';
                        this.subline.style.height = tableRect.height + 'px';
                    }
                    else {
                        this.subline.style.display = 'none';
                        this.subline.removeAttribute('data-index');
                    }
                },
                moveEnd: async (ev, isMove) => {
                    if (isMove) {
                        var newColIndex = parseInt(this.subline.getAttribute('data-index'));
                        if (!isNaN(newColIndex) && newColIndex != colIndex)
                            self.block.onChangeColumnIndex(colIndex, newColIndex);
                        self.isMoveLine = false;
                        this.subline.style.display = 'none';
                        this.subline.removeAttribute('data-index');
                        ghostView.unload();
                    }
                    else {
                        try {
                            await self.block.onColContextMenu(colIndex, ev);
                        }
                        catch (e) {
                            self.block.page.onError(e);
                        }
                        self.isMoveLine = false;
                    }
                }
            })
        }
        else if (arrow == 'left') {
            self.isMoveLine = true;
            var trs = Array.from(this.table.querySelector('tbody').children);
            var rowIndex = parseInt(self.leftDrag.getAttribute('data-index'));
            MouseDragger<{ colIndex: number, colWidth: number, colEle: HTMLElement }>({
                event,
                moveStart: (ev, data) => {
                    var html = trs[rowIndex].outerHTML;
                    ghostView.load(`<div class='sy-block-table'><table>
                    ${this.table.querySelector('colgroup').outerHTML}
                    <tbody>${html}</tbody>
                    </table></div>`, { point: Point.from(event) });
                    self.leftDrag.style.display = 'none';
                },
                moving: (ev, data, isend) => {
                    if (isend) return;
                    ghostView.move(Point.from(ev));
                    var isFind: boolean = false;
                    for (let s = 0; s < trs.length; s++) {
                        var tr = trs[s] as HTMLElement;
                        var trRect = Rect.fromEle(tr);
                        if (ev.clientY >= trRect.top && ev.clientY <= trRect.bottom) {
                            var index = s;
                            if (ev.clientY > trRect.middle) {
                                index += 1;
                                this.sublineX.style.top = (trRect.bottom - boxRect.top) + 'px';
                            }
                            else {
                                this.sublineX.style.top = (trRect.top - boxRect.top) + 'px';
                            }
                            this.sublineX.style.width = trRect.width + 'px';
                            this.sublineX.style.display = 'flex';
                            this.sublineX.setAttribute('data-index', index.toString());
                            isFind = true;
                            break;
                        }
                    }
                    if (!isFind) {
                        this.sublineX.style.display = 'none';
                        this.sublineX.removeAttribute('data-index');
                    }
                },
                moveEnd: async (ev, isMove) => {
                    if (isMove) {
                        var newRowIndex = parseInt(this.sublineX.getAttribute('data-index'));
                        ghostView.unload();
                        if (!isNaN(newRowIndex) && rowIndex != newRowIndex) {
                            self.block.onChangeRowIndex(rowIndex, newRowIndex);
                        }
                    }
                    if (!isMove) {
                        self.block.onRowContextmenu(rowIndex, ev);
                    }
                    self.isMoveLine = false;
                    this.sublineX.style.display = 'none';
                }
            })
        }
    }
    onMouseleave() {
        if (this.isMoveLine == false) {
            if (this.subline) {
                this.subline.style.display = 'none';
                this.sublineX.style.display = 'none';
                this.bottomPlus.style.display = 'none';
                this.rightPlus.style.display = 'none';
                this.resizePlus.style.display = 'none';
                this.topDrag.style.display = 'none';
                this.leftDrag.style.display = 'none';
            }
        }
        if (this.tableOperator) this.tableOperator.style.display = 'none';
    }
    table: HTMLElement;
    box: HTMLElement;
    subline: HTMLElement;
    sublineX: HTMLElement;
    bottomPlus: HTMLElement;
    rightPlus: HTMLElement;
    resizePlus: HTMLElement;
    topDrag: HTMLElement;
    leftDrag: HTMLElement;
    tableOperator: HTMLElement;
    private isMoveLine: boolean = false;
    onBoardDrag(event: React.MouseEvent) {
        event.stopPropagation();
        BoardDrag(this.block.page.kit, this.block, event, {
            moveEnd: (ev, isM, d) => {
                if (!isM) {
                    this.block.onContextmenu(ev)
                }
            }
        });
    }
    renderView() {
        var s = this.block.globalMatrix.getScaling().x;
        var contentStyle: CSSProperties = this.block.contentStyle;
        if (this.block.isFreeBlock) {
            contentStyle = Object.assign(contentStyle, {
                paddingTop: '0rem',
                paddingLeft: '0rem',
                paddingRight: '0rem',
                paddingBottom: '0rem',
                margin: '2rem',
                backgroundColor: '#fff'
            })
        }
        else {
            contentStyle = Object.assign(contentStyle, {
                paddingTop: '0rem',
                paddingLeft: '0rem',
                paddingRight: '0rem',
                paddingBottom: '0rem',
                margin: '2rem 0.2rem'
            })
        }
        contentStyle['--table-border'] = `${this.block.lineWidth}px ${this.block.lineType} ${this.block.lineColor}`;
        return <div style={this.block.visibleStyle}
            onMouseMove={e => this.mousemove(e.nativeEvent)}
            onMouseLeave={e => this.onMouseleave()}
        ><div className='sy-block-table relative'
            style={contentStyle}
        >
                <div className='sy-block-table-box'
                    style={{ overflow: this.block.isFreeBlock ? "visible" : undefined }}
                    ref={e => this.box = e}>
                    <table ref={e => this.table = e}>
                        <colgroup>
                            {this.block.cols.map((col, index) => {
                                return <col key={index} style={{ minWidth: col.width, width: col.width }}></col>
                            })}
                        </colgroup>
                        <tbody>
                            <ChildsArea childs={this.block.childs}></ChildsArea>
                        </tbody>
                    </table>
                </div>
                {this.block.isCanEdit() && <div
                    style={this.block.isFreeBlock ? {
                        transform: `scale(${1 / s})`,
                        transformOrigin: '0 0',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none'
                    } : {}}
                >
                    <div className='sy-block-table-subline' onMouseDown={e => this.onMousedownLine(e)} ref={e => this.subline = e}></div>
                    <div className='sy-block-table-subline-x' ref={e => this.sublineX = e}></div>
                    <div onMouseDown={e => this.onMousedownDrag(e, 'top')} ref={e => this.topDrag = e} className="sy-block-table-top-drag ">
                        <span className="flex-center cursor round padding-h-5 padding-w-2 rotate-90 pos-center item-hover-button" >
                            <Icon size={10} icon={DragHandleSvg}></Icon>
                        </span>
                    </div>
                    <div onMouseDown={e => this.onMousedownDrag(e, 'left')} ref={e => this.leftDrag = e} className="sy-block-table-left-drag">
                        <span className="flex-center cursor round padding-w-2 padding-h-5 pos-center item-hover-button">
                            <Icon size={10} icon={DragHandleSvg}></Icon>
                        </span>
                    </div>
                    <ToolTip overlay={<div><S>点击添加行</S><br /><S>拖动批量创建行</S></div>}><div onMouseDown={e => this.onMousedownResize(e, 'bottom')} ref={e => this.bottomPlus = e} className="sy-block-table-bottom-plus"><span className="size-20 round flex-center item-hover-button"><Icon size={14} icon={PlusSvg}></Icon></span></div></ToolTip>
                    <ToolTip overlay={<div><S>点击添加列</S><br /><S>拖动批量创建列</S></div>}><div onMouseDown={e => this.onMousedownResize(e, 'right')} ref={e => this.rightPlus = e} className="sy-block-table-right-plus"><span className="size-20 round  flex-center item-hover-button"><Icon size={14} icon={PlusSvg}></Icon></span></div></ToolTip>
                    <ToolTip overlay={<div><S>点击添加行列</S><br /><S>拖动批量创建行列</S></div>}><div onMouseDown={e => this.onMousedownResize(e, 'resize')} ref={e => this.resizePlus = e} className="sy-block-table-resize-plus"><span className="size-20 round  flex-center item-hover-button"><Icon size={14} icon={PlusSvg}></Icon></span></div></ToolTip>
                    {this.block.isFreeBlock && <div
                        ref={e => this.tableOperator = e}
                        style={{ pointerEvents: 'none' }}
                        className='sy-block-table-box-dots flex'>
                        <span
                            onMouseDown={e => {
                                this.onBoardDrag(e)
                            }}
                            style={this.block.isFreeBlock ? {
                                // transform: `scale(${1 / s})`,
                                // transformOrigin: '0 0',
                                zIndex: 10,
                                pointerEvents: 'visible'
                            } : {}}
                            className="flex-center size-20 round flex-center cursor item-hover-button">
                            <Icon size={12} icon={DragHandleSvg}></Icon>
                        </span>
                    </div>}
                </div>}

            </div>
        </div>
    }
}