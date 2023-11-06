import React from "react";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { DoubleLeftSvg, DoubleRightSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { S } from "../../../i18n/view";
import { ElementType } from "../../../net/element.type";

@url('/page/preOrNext')
export class PageOrNext extends Block {

}

@view('/page/preOrNext')
export class PageOrNextView extends BlockView<PageOrNext>{
    renderView() {
        var arrowSize = 20;
        if (this.block.page.pe.type == ElementType.SchemaRecordView) {
            return <div style={this.block.visibleStyle}>
                <div style={this.block.contentStyle}>
                    <div className='flex flex-top' ><a className="w50 gap-r-20 flex flex-top"
                        style={{ cursor: 'default' }}>
                        <span className="flex-center flex-fixed" style={{ height: this.block.page.lineHeight }}><Icon className={'remark-im'} size={arrowSize} icon={DoubleLeftSvg}></Icon></span>
                        <span className="gap-w-5  remark-im  flex-fixed"><S>上一篇</S></span>
                        <span className={'flex-auto ' + ("remark-im")}><S>没有了</S></span>
                    </a>
                    <a className="w50 gap-l-20  flex-end flex-top"
                            style={{ cursor: 'default' }}>
                            <span className={"gap-w-5 flex-auto flex-end " + "remark-im"}><S>没有了</S></span>
                            <span className={'flex-fixed remark-im  f-14'} ><S>下一篇</S></span>
                            <span className="flex-fixed flex-center" style={{ height: this.block.page.lineHeight }}><Icon className={'remark-im'} size={arrowSize} icon={DoubleRightSvg}></Icon></span>
                        </a>
                    </div>
                </div>
            </div>
        }
        return <div style={this.block.visibleStyle}>
            <div style={this.block.contentStyle}>
                <div className='flex flex-top' >
                    <a className="w50 gap-r-20 flex flex-top"
                        style={{ cursor: this.block.page.formPreRow ? 'pointer' : 'default' }}
                        onClick={e => {
                            this.block.page.onFormOpen('prev')
                        }}>
                        <span className="flex-center flex-fixed" style={{ height: this.block.page.lineHeight }}><Icon className={'remark-im'} size={arrowSize} icon={DoubleLeftSvg}></Icon></span>
                        <span className="gap-w-5  remark-im  flex-fixed"><S>上一篇</S></span>
                        <span className={'flex-auto' + (this.block.page.formPreRow ? "" : "remark-im")}>{this.block.page.formPreRow ? this.block.page.formPreRow?.title : <S>没有了</S>}</span>
                    </a>
                    <a className="w50 gap-l-20  flex-end flex-top"
                        style={{ cursor: this.block.page.formNextRow ? 'pointer' : 'default' }}
                        onClick={e => {
                            this.block.page.onFormOpen('next')
                        }}>
                        <span className={"gap-w-5 flex-auto flex-end " + (this.block.page.formNextRow ? "" : "remark-im")}>{this.block.page.formNextRow ? this.block.page.formNextRow?.title : <S>没有了</S>}</span>
                        <span className={'flex-fixed remark-im '}><S>下一篇</S></span>
                        <span className="flex-fixed flex-center" style={{ height: this.block.page.lineHeight }} ><Icon className={'remark-im'} size={arrowSize} icon={DoubleRightSvg}></Icon></span>
                    </a>
                </div>
            </div>
        </div>
    }
}