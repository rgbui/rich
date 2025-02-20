import React from "react";
import { Block } from "../../../../src/block";
import { DataGridView } from "../base";
import { isMobileOnly } from "react-device-detect";
import { CardFactory } from "../../template/card/factory/factory";
import { TableStoreGallery } from ".";

export class GalleryContent extends React.Component<{
    block: Block,
    childs?: Block[],
    groupHead?: ArrayOf<DataGridView['dataGroupHeads']>
}> {
    get block() {
        return this.props.block as TableStoreGallery
    }
    renderRows() {
        var childs = this.props.childs || this.block.childs;
        if (childs.length == 0) return <div className="flex-center w100">
            <span className="remark f-14">没有数据</span>
        </div>
        var eles: JSX.Element[] = [];
        var size = this.block.gallerySize || 3;
        if (size == -1) {
            var w = 800;
            if (this.block.el) {
                w = this.block.el.clientWidth;
                if (w == 0) w = 800;
            }
            size = Math.floor(w / 220)
        }
        if (typeof size != 'number') size = 3;
        var gap = 20;
        if (isMobileOnly) { size = 2; gap = 8; }
        // var w = (100 / size).toFixed(2);
        var wd = `calc((100% - ${(size - 1) * gap}px ) / ${size})`
        // n*w + (n-1)*gap = 100%
        //w=(100%-(n-1)* gap)/n
        // console.log('cc',this.block.isCardAuto, this.block.cardConfig.auto, this.block.cardConfig);

        if (this.block.isCardAuto) {
            var rss = [];
            for (let j = 0; j < size; j++) {
                rss.push([]);
            }
            for (let i = 0; i < childs.length; i++) {
                var c = i % size;
                rss[c].push(childs[i]);
            }
            eles = rss.map((rs, i) => {
                return <div className='sy-data-grid-gallery-column' style={{ width: wd, marginRight: i == rss.length - 1 ? undefined : gap, marginBottom: undefined }} key={i}>
                    {rs.map(c => <div className="sy-data-grid-gallery-cell w100"
                        onMouseDown={e => {
                            e.stopPropagation();
                            this.block.onOpenEditForm(c.id);
                        }}
                        key={c.id}>{this.renderItem(c)}</div>)}
                </div>
            })
        }
        else {
            for (let i = 0; i < childs.length; i++) {
                var cs: Block[] = [];
                for (let j = 0; j < size; j++) {
                    if (i + j < childs.length) {
                        cs.push(childs[i + j])
                    }
                }
                i += (size - 1);
                eles.push(<div className='sy-data-grid-gallery-row' key={i}>
                    {cs.map((c, j) => <div
                        onMouseDown={e => {
                            e.stopPropagation();
                            this.block.onOpenEditForm(c.id);
                        }}
                        className="sy-data-grid-gallery-cell"
                        style={{ width: wd, marginRight: cs.length - 1 == j ? undefined : gap, marginBottom: undefined }}
                        key={c.id}>{
                            this.renderItem(c)
                        }
                    </div>)}
                </div>)
            }
        }
        return eles;
    }
    renderItem(itemBlock: Block) {
        if (this.block.cardConfig.showMode == 'define' && this.block.cardConfig.templateProps.url) {
            var CV = CardFactory.getCardView(this.block.cardConfig.templateProps.url);
            if (CV) return <CV item={itemBlock as any} dataGrid={this.block}></CV>
        }
        return <itemBlock.viewComponent block={itemBlock}></itemBlock.viewComponent>
    }
    render() {
        return <div className={"sy-data-grid-gallery-list" + (this.block.isCardAuto ? " sy-data-grid-gallery-list-cols" : "")}>{this.renderRows()} </div>
    }
}