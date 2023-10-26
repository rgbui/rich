import React from "react";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { DoubleLeftSvg, DoubleRightSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { S } from "../../../i18n/view";

@url('/page/preOrNext')
export class PageOrNext extends Block {

}

@view('/page/preOrNext')
export class PageOrNextView extends BlockView<PageOrNext>{
    renderView() {
        return <div style={this.block.visibleStyle}>
            <div className='flex' ><a className="w50 gap-r-20 flex"
                style={{ cursor: this.block.page.formPreRow ? 'pointer' : 'default' }}
                onClick={e => {
                    this.block.page.onFormOpen('prev')
                }}>
                <Icon className={'remark-im'} size={16} icon={DoubleLeftSvg}></Icon>
                <span className="gap-w-5  remark-im f-14"><S>上一篇</S></span>
                <span className={this.block.page.formPreRow ? "" : "remark-im"}>{this.block.page.formPreRow ? this.block.page.formPreRow?.title : <S>没有了</S>}</span>
            </a>
                <a className="w50 gap-l-20  flex-ebd"
                    style={{ cursor: this.block.page.formNextRow ? 'pointer' : 'default' }}
                    onClick={e => {
                        this.block.page.onFormOpen('next')
                    }}>
                    <span className={'remark-im  f-14'} ><S>下一篇</S></span>
                    <span className={"gap-w-5 " + (this.block.page.formNextRow ? "" : "remark-im")}>{this.block.page.formNextRow ? this.block.page.formNextRow?.title : <S>没有了</S>}</span>
                    <Icon className={'remark-im'} size={16} icon={DoubleRightSvg}></Icon>
                </a></div>
        </div>
    }
}