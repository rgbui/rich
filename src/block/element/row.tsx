
import React from 'react';
import { Block } from '..';
import { Rect } from '../../common/vector/point';
import { BlockView } from '../view';
import { BlockDisplay } from '../enum';
import { url, view } from '../factory/observable';
import { MouseDragger } from '../../common/dragger';
import { ActionDirective } from '../../history/declare';
import { HorizontalDistributionSvg } from '../../../component/svgs';
import { Icon } from '../../../component/view/icon';
import { ToolTip } from '../../../component/view/tooltip';
import { lst } from '../../../i18n/store';

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
}

@view('/row')
export class RowView extends BlockView<Row>{
    mousedown(index: number, event: React.MouseEvent) {
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
            }
        })
    }
    async agvCols(event: React.MouseEvent) {
        event.stopPropagation();
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
            if (this.block.isCanEdit()) {
                if (i > 0) ps.push(<div
                    onMouseDown={e => { this.mousedown(i, e); }}
                    key={block.id + 'gap'}
                    data-index={i}
                    className='sy-block-row-gap'>
                    <i className='flex-center'>
                        <ToolTip overlay={lst('平均分栏')}><span onMouseDown={e => this.agvCols(e)} style={{ background: '#eee' }} className={'size-24 remark  flex-center round cursor '}><Icon size={16} icon={HorizontalDistributionSvg}></Icon></span></ToolTip>
                    </i>
                    <em></em>
                </div>)
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
