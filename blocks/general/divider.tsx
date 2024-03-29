import { BlockView } from "../../src/block/view";
import React, { CSSProperties } from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { Block } from "../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { Rect } from "../../src/common/vector/point";
import lodash from "lodash";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { ls, lst } from "../../i18n/store";

@url('/divider')
export class Divider extends Block {
    display = BlockDisplay.block;
    async getHtml() {
        return `<hr/>`
    }
    async getMd() {
        return '----------------------'
    }
    @prop()
    lineType: 'solid' | 'dashed' | 'double' | 'double-dashed' | 'dotted' = 'solid';
    @prop()
    lineColor: string = 'rgba(55,53,47,0.2)';
    @prop()
    lineWidth = 1;
    getVisibleHandleCursorPoint() {
        var h = this.el.querySelector('div') as HTMLElement;
        var bound = Rect.fromEle(h);
        if (bound) {
            return bound.leftMiddle;
        }
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var at = rs.findIndex(g => g.name == BlockDirective.comment);
        lodash.remove(rs, g => g.name == 'color');
        var ns: MenuItem<string | BlockDirective>[] = [];
        ns.push({
            text: lst('分割线'),
            icon: { name: 'byte', code: "dividing-line-one" },
            childs: [
                {
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
                            text: lst('点虚线'),
                            value: 'dotted',
                            checkLabel: this.lineType == 'dotted'
                        },
                        {
                            name: 'lineType',
                            text: lst('双线'),
                            value: 'double',
                            checkLabel: this.lineType == 'double'
                        },
                        {
                            name: 'lineType',
                            text: lst('双虚线'),
                            value: 'double-dashed',
                            checkLabel: this.lineType == 'double-dashed'
                        }
                    ]
                },
                {
                    text: lst('线宽'),
                    icon: { name: 'bytedance-icon', code: 'auto-height-one', rotate: 90 },
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
                        }
                    ]
                },
                { type: MenuItemType.divide },
                {
                    text: lst('颜色'),
                    type: MenuItemType.text
                },
                { type: MenuItemType.gap },
                {
                    name: 'lineColor',
                    type: MenuItemType.color,
                    block: ls.isCn ? false : true,
                    options: [
                        { color: 'inherit', text: lst('默认') },
                        { color: 'rgba(55,53,47,0.2)', text: lst('浅灰') },
                        { color: 'rgba(55,53,47,0.6)', text: lst('灰色') },
                        { color: 'rgb(33,33,33)', text: lst('黑色') },
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
                }
            ]
        })
        rs.splice(at - 1, 0, ...ns)
        var at = rs.findIndex(c => c.name == BlockDirective.delete);
        rs.splice(at + 1, 0, { type: MenuItemType.divide }, {
            type: MenuItemType.help,
            text: lst('了解如何使用分割线'),
            url: window.shyConfig?.isUS ? "https://help.shy.live/page/258" : "https://help.shy.live/page/258"
        })
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent): Promise<void> {
        if (item.name == 'lineType' || item.name == 'lineWidth' || item.name == 'lineColor') {
            await this.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self })
            return;
        }
        return await super.onClickContextMenu(item, event);
    }
}

@view('/divider')
export class DividerView extends BlockView<Divider>{
    renderView() {
        var style: CSSProperties = {
            height: '1px',
            width: '100%',
            borderBottom: '1px solid rgba(55, 53, 47, 0.09)'
        };
        if (this.block.lineType == 'dashed') style.borderBottom = this.block.lineWidth + 'px dashed ' + this.block.lineColor;
        else if (this.block.lineType == 'dotted') style.borderBottom = this.block.lineWidth + 'px dotted ' + this.block.lineColor;
        else if (this.block.lineType == 'solid') style.borderBottom = this.block.lineWidth + 'px solid ' + this.block.lineColor;
        else if (this.block.lineType == 'double') {
            style.borderTop = this.block.lineWidth + 'px solid ' + this.block.lineColor;
            style.borderBottom = this.block.lineWidth + 'px solid ' + this.block.lineColor;
            style.height = '3px';
        }
        else if (this.block.lineType == 'double-dashed') {
            style.borderTop = this.block.lineWidth + 'px dashed ' + this.block.lineColor;
            style.borderBottom = this.block.lineWidth + 'px dashed ' + this.block.lineColor;
            style.height = '3px';
        }

        return <div style={this.block.visibleStyle}>
            <div className='h-16 flex-center' style={this.block.contentStyle}>
                <div style={style}></div>
            </div>
        </div>
    }
}