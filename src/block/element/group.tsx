
import React from 'react';
import { Block } from '..';
import { BlockView } from '../view';
import { BlockDisplay } from '../enum';
import { url, view } from '../factory/observable';
import { Matrix } from '../../common/matrix';

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
    async setBoardEditCommand(this: Block, name: string, value: any) {
        if (name == 'ungroup') {
            var bs = this.blocks.childs.map(c => c);
            for (let i = 0; i < bs.length; i++) {
                var b = bs[i];
                var r = b.getTranslation().base(this.getTranslation());
                var nm = new Matrix();
                nm.translate(r);
                nm.rotate(b.matrix.getRotation(), { x: 0, y: 0 });
                await b.updateMatrix(b.matrix, nm);
            }
            await this.parent.appendArray(bs, this.at, this.parentKey);
            await this.delete();
            setTimeout(() => {
                this.page.kit.picker.onPicker(bs);
            }, 200);
        }
    }
}
@view('/group')
export class GroupView extends BlockView<Group> {
    renderView() {
        var style = Object.assign({
            width: this.block.fixedWidth,
            height: this.block.fixedHeight
        }, this.block.visibleStyle);
        return <div className='sy-block-group' style={style} >{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>
        )}</div>
    }
}