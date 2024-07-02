import React from "react";
import { Rect } from "../../../../src/common/vector/point";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { TableStoreBoard } from ".";

export class ScrollXDataGridBoard extends React.Component<{
    className?: string | (string[]),
    block: TableStoreBoard,
    children: React.ReactNode,
}> {
    get isScrollX() {
        if (this.block?.parent?.url == BlockUrlConstant.View) return true;
        if (this.block.parent?.parent?.url == BlockUrlConstant.DataGridTab && this.block?.parent.parent?.parent?.url == BlockUrlConstant.View) return true;
        else return false;
    }
    get block() {
        return this.props.block;
    }
    isCacScroll: boolean = false;
    componentDidMount(): void {
        this.AdjustWidth()
    }
    AdjustWidth() {
        if (!this.isScrollX) return;
        var bo = Rect.fromEle(this.props.block.page.root);
        var cr = Rect.fromEle(this.sx);
        if (cr.width == 0 && this.block.dataGridTab&&!this.block.dataGridTab?.el) {
            this.block.dataGridTab.mounted(() => {
                this.AdjustWidth()
            })
            return;
        }
        if (this.block.dataGridTab && this.block.dataGridTab.el) {
            cr = Rect.fromEle(this.block.dataGridTab.el);
        }
        this.pl = cr.left - bo.left;
        this.pr = bo.right - cr.right;
        this.isCacScroll = true;
        this.forceUpdate()
    }
    sx: HTMLElement;
    pl: number;
    pr: number;
    render() {
        if (this.isCacScroll == false && this.isScrollX) return <div ref={e => this.sx = e}> </div>
        var props = this.props;
        var isScrollX: boolean = this.isScrollX;
        var classList: string[] = [];
        if (props.className) {
            if (typeof props.className == 'string') {
                classList.push(props.className);
            } else {
                classList.push(...props.className);
            }
        }
        if (!isScrollX) return <div>
            <div style={{
                overflowX: 'auto',
            }} onScroll={(e) => this.content_scroll(e)} className={classList.join(' ')}>{props.children}</div>
        </div>;
        var width =this.block.dataGroups.findAll(g => this.block.hideGroups.some(s => s == g.value) ? false : true).length * 240 + (this.block.dataGridIsCanEdit() ? 240 : 0);
        return <div  ref={e => this.sx = e}>
            <div onScroll={(e) => this.content_scroll(e)} className={classList.join(' ') + ""} style={{
                overflowX: 'auto',
                transform: 'translateX(-' + this.pl + 'px)',
                width: 'calc(100% + ' + (this.pl + this.pr) + 'px)',
                boxSizing: 'border-box'
            }}>
                <div className='round' style={{
                    backgroundColor: '#fff',
                    marginLeft: this.pl,
                    marginRight: this.pr,
                    width,
                }}>{props.children}
                </div>
            </div>
        </div>
    }
    headScrollEl: HTMLElement;
    bindScroll() {
        if (this.headScrollEl) {
            this.headScrollEl.removeEventListener('scroll', this.head_scroll);
            this.headScrollEl.addEventListener('scroll', this.head_scroll);
        }
    }
    head_scroll = (e) => {
        var box = this.block.el.querySelector('.sy-dg-table-content');
        if (box) {
            box.scrollLeft = this.headScrollEl.scrollLeft;
        }
    }
    willUnmount() {
        if (this.headScrollEl) {
            this.headScrollEl.removeEventListener('scroll', this.head_scroll);
        }
    }
    content_scroll = (e) => {
        var box = this.block.el.querySelector('.sy-dg-table-content');
        if (box) {
            var headScrollEl = this.block.el.querySelector('.scroll-hidden') as HTMLElement;
            headScrollEl.scrollLeft = box.scrollLeft;
            var group_heads = this.block.el.querySelectorAll('[data-sy-table="group-head"]');
            group_heads.forEach(h => {
                (h as HTMLElement).style.transform = `translateX(${box.scrollLeft}px)`;
                // (h as HTMLElement).style.marginLeft = `${box.scrollLeft}px`;
            })
        }
    }
}

