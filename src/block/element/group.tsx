
import React from 'react';
import { Block } from '..';
import { BlockView } from '../view';
import { BlockDisplay } from '../enum';
import { url, view } from '../factory/observable';
import { Point, PointArrow, Rect, RectUtility } from '../../common/vector/point';
import lodash from 'lodash';
import { Matrix } from '../../common/matrix';
import { BlockUrlConstant } from '../constant';


/**
 * 可以将相邻的block变成一个整体去操作，
 * 可以看成是contentBlock
 */
@url('/group')
export class Group extends Block {
    display = BlockDisplay.block;
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: "ungroup" });
        return cs;
    }
    async setBoardEditCommand(name: string, value: any) {
        if (name == 'ungroup') {
            await this.unmerge();
        }
    }
    get fixedSize() {
        // var b = this.getBounds();
        // return {
        //     width: b.width,
        //     height: b.height
        // }
        return {
            width: this.fixedWidth,
            height: this.fixedHeight
        }
    }
    onResizeBoardSelector(arrows: PointArrow[], event: React.MouseEvent) {
        this.onResizeScaleBoardSelector(arrows, event);
    }
    getBounds() {
        var cs = this.childs;
        var bs = cs.map(c => {
            var size = c.fixedSize;
            var rect = new Rect(0, 0, size.width, size.height);
            rect = rect.transformToBound(c.currentMatrix);
            return rect;
        });
        lodash.remove(bs, g => g ? false : true);
        var points = bs.map(b => b.points).flat();
        return RectUtility.getPointsBound(points)
    }
    async updateGroupRange() {
        var blocks = this.childs.map(c => c);
        var bs: Rect[] = [];
        blocks.forEach(c => {
            var { width, height } = c.fixedSize;
            var rect = new Rect(0, 0, width, height);
            var ma = this.matrix.clone();
            var gm = ma.append(c.currentMatrix);
            var nb = rect.transformToBound(gm);
            bs.push(nb);
        });
        var nr = bs.first();
        bs.forEach((b, i) => {
            if (i > 0) {
                nr = nr.merge(b);
            }
        })
        nr = nr.transformInverseToBound(this.matrix);
        var ma = new Matrix();
        ma.translate(nr.leftTop.x, nr.leftTop.y);
        var newMa = this.matrix.clone().append(ma);
        await this.updateProps({
            fixedWidth: nr.width,
            fixedHeight: nr.height
        });
        var oldMa = this.matrix.clone();
        await this.updateMatrix(this.matrix, newMa);
        for (let i = 0; i < blocks.length; i++) {
            var b = blocks[i];
            var oc = oldMa.clone().append(b.matrix).transform(new Point(0, 0));
            var nc = this.matrix.clone().append(b.matrix).inverseTransform(oc);
            var mb = new Matrix();
            mb.translate(nc.x, nc.y);
            var nm = b.matrix.clone().append(mb);
            await b.updateMatrix(b.matrix, nm);
        }
    }
    async unmerge() {
        var bs = this.blocks.childs.map(c => c);
        for (let i = 0; i < bs.length; i++) {
            var b = bs[i];
            if ([BlockUrlConstant.BoardImage,
            BlockUrlConstant.File,
            BlockUrlConstant.Group,
            BlockUrlConstant.Pen,
            BlockUrlConstant.Katex,
            ].includes(b.url as any)) {
                var ma = this.matrix.clone();
                var nm = ma.append(b.matrix);
                await b.updateMatrix(b.matrix, nm);
            }
            else if (b.url == BlockUrlConstant.TextSpan) {
                var ma = this.matrix.clone();
                var nm = ma.append(b.matrix);
                var r = nm.getScaling().x;
                await b.updateProps({
                    // fixedWidth: b.fixedWidth * r,
                    fontScale: (b as any).fontScale * r
                });
                nm.scale(1 / r, 1 / r, { x: 0, y: 0 });
                await b.updateMatrix(b.matrix, nm);
            }
            else {
                var ma = this.matrix.clone();
                var nm = ma.append(b.matrix);
                var r = nm.getScaling().x;
                console.log('rrr', r);
                await b.updateProps({
                    fixedWidth: b.fixedWidth * r,
                    fixedHeight: b.fixedHeight * r
                });
                nm.scale(1 / r, 1 / r, { x: 0, y: 0 });
                await b.updateMatrix(b.matrix, nm);
            }
        }
        await this.parent.appendArray(bs, this.at, this.parentKey);
        await this.delete();
        setTimeout(() => {
            this.page.kit.picker.onPicker(bs);
        }, 200);
    }
    async mergeBlocks(blocks: Block[]) {
        var bs: Rect[] = [];
        blocks.forEach(c => {
            var { width, height } = c.fixedSize;
            var rect = new Rect(0, 0, width, height);
            var gm = c.currentMatrix.clone();
            var nb = rect.transformToBound(gm);
            bs.push(nb);
        });
        var nr = bs.first();
        bs.forEach((b, i) => {
            if (i > 0) {
                nr = nr.merge(b);
            }
        })
        var ma = new Matrix();
        ma.translate(nr.leftTop.x, nr.leftTop.y);
        await this.updateProps({
            fixedWidth: nr.width,
            fixedHeight: nr.height
        });
        await this.updateMatrix(this.matrix, ma);
        for (let i = 0; i < blocks.length; i++) {
            var b = blocks[i];
            var mc = ma.clone() as Matrix;
            var nm = mc.inverted().append(b.matrix);
            await b.updateMatrix(b.matrix, nm);
        }
        await this.appendArray(blocks, this.childs.length);
    }
}

@view('/group')
export class GroupView extends BlockView<Group> {
    renderView() {
        var fs = this.block.fixedSize;
        var style = Object.assign({
            width: fs.width,
            height: fs.height
        }, this.block.visibleStyle);
        return <div className='sy-block-group' style={style} >{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>
        )}</div>
    }
}