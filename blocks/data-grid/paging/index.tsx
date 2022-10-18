import React from "react";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { DataGridView } from "../view/base";

@url('/data-grid/paging')
export class Paging extends Block {
    display = BlockDisplay.block;
    get refBlock(): DataGridView {
        return super.refBlock as DataGridView;
    }
    onChangeIndex(index: number) {
        if (typeof index == 'number')
            this.refBlock.onChangeIndex(index);
    }
    async onSyncReferenceBlock() {
        this.view.forceUpdate();
    }
}

@view('/data-grid/paging')
export class PagingView extends BlockView<Paging>{
    getPages() {
        if (this.block.refBlock) {
            var page = Math.ceil(this.block.refBlock.total / this.block.refBlock.size);
            var index: number = this.block.refBlock.index;
            if (index <= 0) index = 1;
            if (index > page) index = page;
            var ps: (string | number)[] = [];
            if (this.block.refBlock.total > 0) {
                if (index - 3 > 1) [1, "...", index - 2, index - 1, index].forEach((p) => ps.push(p));
                else for (var i = 1; i <= index; i++) ps.push(i);
                if (index + 3 < page) [index + 1, index + 2, "...", page].forEach((p) => ps.push(p));
                else for (var j = index + 1; j <= page; j++) ps.push(j);
            } else ps = [];
            return ps.map((p) => {
                var classList: string[] = ["sy-paging-page"];
                if (p == index) classList.push("sy-paging-current");
                else if (typeof p == "number") {
                } else classList.push("sy-paging-text");
                return {
                    text: p,
                    index: typeof p == "number" ? p : undefined,
                    classList,
                };
            });
        }
        return []

    }
    render() {
        return <div className='sy-paging'>{this.getPages().map((pa, index) => {
            return <a key={index} className={pa.classList.join(" ")} onMouseDown={e => this.block.onChangeIndex(pa.index)}>{pa.text}</a>
        })}</div>
    }
}