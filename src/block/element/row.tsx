
import React, { CSSProperties } from 'react';
import { Block } from '..';
import { Point, Rect } from '../../common/vector/point';
import { BlockView } from '../view';
import { BlockDirective, BlockDisplay, BlockRenderRange } from '../enum';
import { prop, url, view } from '../factory/observable';
import { MouseDragger } from '../../common/dragger';
import { ActionDirective } from '../../history/declare';
import { BlockcolorSvg, HorizontalDistributionSvg, TrashSvg } from '../../../component/svgs';
import { Icon } from '../../../component/view/icon';
import { ToolTip } from '../../../component/view/tooltip';
import { ls, lst } from '../../../i18n/store';
import { MenuItem, MenuItemType } from '../../../component/view/menu/declare';
import { useSelectMenuItem } from '../../../component/view/menu';
import lodash from 'lodash';
import { Col } from './col';
import { BoxTip } from '../../../component/view/tooltip/box';

/**
 * 分区中会有很多行，每行存在于一个或多个block
 * 
 */
@url('/row')
export class Row extends Block {
    display = BlockDisplay.block;
    get isRow() {
        return true;
    }
    @prop()
    gaps: { at: number, width: number, type: 'solid' | 'double' | 'double-dashed' | 'dashed' | 'none', color: string }[] = [];
}

@view('/row')
export class RowView extends BlockView<Row>{
    mousedown(index: number, event: React.MouseEvent) {
        if (!this.block.isCanEdit()) return;
        var prev = this.block.childs[index - 1]
        var next = this.block.childs[index];
        var self = this;
        var pw = Rect.fromEle(prev.el);
        var nw = Rect.fromEle(next.el);
        event.stopPropagation();
        MouseDragger({
            event,
            moveStart(e) {
                self.block.childs.each(child => {
                    child.el.style.width = child.el.getBoundingClientRect().width + 'px';
                });
            },
            move(ev, d) {
                var dx = ev.clientX - event.clientX;
                if (pw.width + dx > 20 && pw.width - dx > 20) {
                    prev.el.style.width = (pw.width + dx) + 'px';
                    next.el.style.width = (nw.width - dx) + 'px';
                }
            },
            async moveEnd(ev, isMove) {
                if (isMove) {
                    var ws: { block: Block, width: number }[] = [];
                    self.block.childs.each(child => {
                        ws.push({ block: child, width: child.el.getBoundingClientRect().width })
                    });
                    await self.block.page.onAction(ActionDirective.onUpdateProps, async () => {
                        var total = ws.sum(x => x.width);
                        await ws.eachAsync(async (w) => {
                            await w.block.updateProps({ widthPercent: Math.round(w.width * 100 / total) })
                        })
                    });
                }
                else {
                    self.contextmenu(index, ev)
                }
            }
        })
    }
    async contextmenu(index: number, event: MouseEvent | React.MouseEvent | Point) {
        var p = Point.from(event);
        var oldGaps = lodash.cloneDeep(this.block.gaps);
        var gap = this.block.gaps.find(c => c.at == index);
        var ns: MenuItem<string | BlockDirective>[] = [];
        ns.push({
            name: 'agvCols',
            text: lst('平均所有列'),
            icon: { name: 'bytedance-icon', code: 'align-text-both' }
        })
        ns.push({
            name: 'agvLeftRightCols',
            text: lst('平均左右列'),
            icon: { name: 'bytedance-icon', code: 'one-to-one' }
        })
        ns.push({ type: MenuItemType.divide });
        ns.push({
            name: 'open',
            text: lst('显示分栏线'),
            icon: { name: 'bytedance-icon', code: 'auto-height-one' },
            checkLabel: gap?.type && gap?.type != 'none'
        })
        ns.push({ type: MenuItemType.divide });
        if (gap?.type && gap?.type != 'none') {
            ns.push({
                text: lst('线类型'),
                icon: { name: 'bytedance-icon', code: 'align-text-both' },
                childs: [
                    {
                        name: 'lineType',
                        text: lst('实线'),
                        value: 'solid',
                        checkLabel: gap?.type == 'solid'
                    },
                    {
                        name: 'lineType',
                        text: lst('虚线'),
                        value: 'dashed',
                        checkLabel: gap?.type == 'dashed'
                    },
                    {
                        name: 'lineType',
                        text: lst('双线'),
                        value: 'double',
                        checkLabel: gap?.type == 'double'
                    },
                    {
                        name: 'lineType',
                        text: lst('双虚线'),
                        value: 'double-dashed',
                        checkLabel: gap?.type == 'double-dashed'
                    }
                ]
            });
            ns.push({
                text: lst('线宽'),
                icon: { name: 'bytedance-icon', code: 'dividing-line' },
                childs: [
                    {
                        name: 'lineWidth',
                        text: '1',
                        value: 1,
                        checkLabel: gap?.width == 1
                    },
                    {
                        name: 'lineWidth',
                        text: '2',
                        value: 2,
                        checkLabel: gap?.width == 2
                    },
                    {
                        name: 'lineWidth',
                        text: '4',
                        value: 4,
                        checkLabel: gap?.width == 4
                    }
                ]
            });
            ns.push({
                text: lst('颜色'),
                icon: BlockcolorSvg,
                childs: [
                    {
                        text: lst('线颜色'),
                        type: MenuItemType.text
                    },
                    {
                        name: 'color',
                        type: MenuItemType.color,
                        block: ls.isCn ? false : true,
                        options: [
                            { color: 'rgba(55, 53, 47, 0.16)', text: lst('灰白色') },
                            { color: 'rgba(55,53,47,0.2)', text: lst('浅灰色') },
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
                                checked: gap?.color == f.color ? true : false
                            }
                        })
                    }
                ]
            });
        }
        if (gap?.type && gap?.type != 'none') {
            ns.push({ type: MenuItemType.divide });
        }
        ns.push({ icon: TrashSvg, name: 'hideAll', text: lst('隐藏所有分栏线'), checkLabel: this.block.gaps.every(c => c.type == 'none') });
        var r = await useSelectMenuItem({ roundPoint: p }, ns);
        if (r?.item) {
            if (r.item.name == 'open') {
                var isOpen = false;
                if (gap) {
                    if (gap.type != 'none')
                        gap.type = 'none'
                    else { gap.type = 'solid'; isOpen = true; }
                }
                else {
                    isOpen = true;
                    this.block.gaps.push({ type: 'solid', at: index, width: 1, color: 'rgba(55, 53, 47, 0.16)' })
                }
                await this.block.onManualUpdateProps({ gaps: oldGaps }, { gaps: this.block.gaps }, { range: BlockRenderRange.self })
                if (isOpen)
                    await this.contextmenu(index, p);
            }
            else if (r.item.name == 'lineType') {
                if (gap) {
                    gap.type = r.item.value;
                    await this.block.onManualUpdateProps({ gaps: oldGaps }, { gaps: this.block.gaps }, { range: BlockRenderRange.self })
                }
            }
            else if (r.item.name == 'lineWidth') {
                if (gap) {
                    gap.width = r.item.value;
                    await this.block.onManualUpdateProps({ gaps: oldGaps }, { gaps: this.block.gaps }, { range: BlockRenderRange.self })
                }
            }
            else if (r.item.name == 'color') {
                if (gap) {
                    gap.color = r.item.value;
                    await this.block.onManualUpdateProps({ gaps: oldGaps }, { gaps: this.block.gaps }, { range: BlockRenderRange.self })
                }
            }
            else if (r?.item.name == 'hideAll') {
                this.block.gaps = [];
                await this.block.onManualUpdateProps({ gaps: oldGaps }, { gaps: this.block.gaps }, { range: BlockRenderRange.self })

            }
            else if (r?.item.name == 'agvCols') {
                await this.agvCols()
            }
            else if (r?.item.name == 'agvLeftRightCols') {
                await this.leftRightCols(index)
            }
        }
    }
    async leftRightCols(index: number, event?: React.MouseEvent) {
        var self = this;
        await self.block.page.onAction(ActionDirective.onUpdateProps, async () => {
            var cs = self.block.childs;
            var c = cs[index - 1];
            var n = cs[index];
            var agv = (c as Col).widthPercent + (n as Col).widthPercent;
            await c.updateProps({ widthPercent: Math.round(agv / 2) });
            await n.updateProps({ widthPercent: Math.round(agv / 2) });
        });
    }
    async agvCols(event?: React.MouseEvent) {
        if (event) event.stopPropagation();
        var self = this;
        await self.block.page.onAction(ActionDirective.onUpdateProps, async () => {
            var cs = self.block.childs;
            await cs.eachAsync(async c => {
                await c.updateProps({ widthPercent: Math.round(1 * 100 / cs.length) })
            })
        });
    }
    renderBlocks() {
        var ps: JSX.Element[] = [];
        for (let i = 0; i < this.block.childs.length; i++) {
            var block = this.block.childs[i];
            if (i > 0) {
                var gapLine = this.block.gaps.find(g => g.at == i);
                if (gapLine?.type && gapLine?.type != 'none') {
                    var style: CSSProperties = {
                        backgroundColor: 'transparent'
                    };
                    if (gapLine?.type == 'dashed') { style.width = 0; style.borderLeft = gapLine.width + 'px dashed ' + gapLine.color; }
                    else if (gapLine?.type == 'solid') { style.width = 0; style.borderLeft = gapLine.width + 'px solid ' + gapLine.color; }
                    else if (gapLine?.type == 'double') {
                        style.borderLeft = gapLine.width + 'px solid ' + gapLine.color;
                        style.borderRight = gapLine.width + 'px solid ' + gapLine.color;
                        style.width = 3;
                    }
                    else if (gapLine?.type == 'double-dashed') {
                        style.borderLeft = gapLine.width + 'px dashed ' + gapLine.color;
                        style.borderRight = gapLine.width + 'px dashed ' + gapLine.color;
                        style.width = 3;
                    }
                    ps.push(<BoxTip
                        onVisible={e => {
                            e.classList.add('hover')
                        }}
                        onClose={e => {
                            e.classList.remove('hover')
                        }}
                        placement='top' overlay={
                            <div className='flex bg-white h-30 round r-gap-w-5 r-item-hover'>
                                <ToolTip overlay={lst('平均所有列')}><span onMouseDown={e => this.agvCols(e)} style={{ background: '#eee' }} className={'size-24 remark  flex-center round cursor '}><Icon size={16} icon={HorizontalDistributionSvg}></Icon></span></ToolTip>
                                <ToolTip overlay={lst('平均左右列')}><span onMouseDown={e => this.leftRightCols(i)} style={{ background: '#eee' }} className={'size-24 remark  flex-center round cursor '}><Icon size={16} icon={{ name: 'bytedance-icon', code: 'one-to-one' }}></Icon></span></ToolTip>
                            </div>
                        }><div
                            onMouseDown={e => {
                                this.mousedown(i, e);
                            }}
                            key={block.id + 'gap'}
                            data-index={i}
                            style={{ opacity: 1, visibility: this.block.isCanEdit() ? undefined : "hidden" }}
                            className='sy-block-row-gap visible-hover'>
                            <em style={style}></em>
                        </div></BoxTip>)
                }
                else {
                    ps.push(<BoxTip onVisible={e => {
                        e.classList.add('hover')
                    }}
                        onClose={e => {
                            e.classList.remove('hover')
                        }}
                        placement='top' overlay={
                            <div className='flex bg-white h-30 round r-gap-w-5 r-item-hover'>
                                <ToolTip overlay={lst('平均所有列')}><span onMouseDown={e => this.agvCols(e)} className={'size-24 remark  flex-center round cursor '}><Icon size={16} icon={HorizontalDistributionSvg}></Icon></span></ToolTip>
                                <ToolTip overlay={lst('平均左右列')}><span onMouseDown={e => this.leftRightCols(i)} className={'size-24 remark  flex-center round cursor '}><Icon size={16} icon={{ name: 'bytedance-icon', code: 'one-to-one' }}></Icon></span></ToolTip>
                            </div>
                        }><div
                            onMouseDown={e => { this.mousedown(i, e); }}
                            key={block.id + 'gap'}
                            data-index={i}
                            style={{ visibility: this.block.isCanEdit() ? "visible" : "hidden" }}
                            className='sy-block-row-gap'>
                            <em></em>
                        </div></BoxTip>)
                }
            }

            ps.push(<block.viewComponent key={block.id} block={block}></block.viewComponent>)
        }
        return ps;
    }
    renderView() {
        return <div className='sy-block-row' ref={e => this.block.childsEl = e}>
            {this.renderBlocks()}
        </div>
    }
}
