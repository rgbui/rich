
import React from 'react';
import { Block } from '..';
import { Point } from '../../common/point';
import { ActionDirective } from '../../history/declare';
import { BlockView } from '../view';
import { BlockDisplay } from '../enum';
import { url, view } from '../factory/observable';
/**
 * 分区中会有很多行，每行存在于一个或多个block
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
    didMount() {
        var self = this;
        document.addEventListener('mousemove', (this._mousemove = (event) => {
            if (self.scope.isDown == true) {
                if (!self.scope.isMove && Point.from(event).nearBy(Point.from(self.scope.event), 5)) {
                    self.scope.isMove = true;
                    self.block.childs.each(child => {
                        child.el.style.width = child.el.getBoundingClientRect().width + 'px';
                    });
                }
                if (self.scope.isMove) {
                    var dx = event.x - self.scope.event.x;
                    if (self.scope.prevWidth + dx > 20 && self.scope.nextWidth - dx > 20) {
                        self.scope.prev.el.style.width = (self.scope.prevWidth + dx) + 'px';
                        self.scope.next.el.style.width = (self.scope.nextWidth - dx) + 'px';
                    }
                }
            }
        }));
        document.addEventListener('mouseup', (this._mouseup = async (event) => {
            if (self.scope.isDown == true) {
                if (self.scope.isMove == true) {
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
                self.scope.isMove = null;
                self.scope.isDown = null;
            }
        }));
    }
    private _mousemove;
    private _mouseup;
    willUnmount() {
        if (this._mousemove) document.removeEventListener('mousemove', this._mousemove);
        if (this._mouseup) document.removeEventListener('mouseup', this._mouseup);
    }
    private scope: {
        prev: Block, next: Block,
        prevWidth: number,
        nextWidth: number,
        isDown: boolean,
        isMove: boolean,
        event: MouseEvent
    } = {
            prev: null,
            prevWidth: null,
            next: null,
            nextWidth: null,
            isDown: false,
            isMove: false,
            event: null
        }
    mousedown(index: number, event: MouseEvent) {
        this.scope.prev = this.block.childs[index - 1];
        this.scope.next = this.block.childs[index];
        this.scope.isDown = true;
        this.scope.isMove = false;
        this.scope.event = event;
        this.scope.prevWidth = this.scope.prev.el.getBoundingClientRect().width;
        this.scope.nextWidth = this.scope.next.el.getBoundingClientRect().width;
    }
    renderBlocks() {
        var ps: JSX.Element[] = [];
        for (let i = 0; i < this.block.childs.length; i++) {
            var block = this.block.childs[i];
            if (i > 0) ps.push(<div onMouseDown={e => { this.mousedown(i, e.nativeEvent); e.stopPropagation() }} key={block.id + 'gap'} className='sy-block-row-gap'></div>)
            ps.push(<block.viewComponent key={block.id} block={block}></block.viewComponent>)
        }
        return ps;
    }
    render() {
        return <div className='sy-block-row' ref={e => this.block.childsEl = e}>
            {this.renderBlocks()}
        </div>
    }
}
