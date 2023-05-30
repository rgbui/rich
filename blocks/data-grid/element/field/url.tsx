import React from "react";
import { LinkSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";
import { TextArea } from "../../../../src/block/view/appear";
import { AppearAnchor } from "../../../../src/block/appear";


@url('/field/url')
export class FieldUrl extends OriginField {
    focusAnchor(anchor: AppearAnchor) {
        if (this.asView<FieldUrlView>()?.span) {
            this.asView<FieldUrlView>().span.style.display = 'none';
        }
    }
    blurAnchor(anchor: AppearAnchor) {
        if (this.asView<FieldUrlView>()?.span) {
            this.asView<FieldUrlView>().span.style.display = 'block';
        }
    }
}
@view('/field/url')
export class FieldUrlView extends BlockView<FieldUrl>{
    isCom: boolean = false;
    span: HTMLElement;
    render() {
        return <div className={'flex l-20  flex-top sy-field-title f-14' + (this.block.value ? " underline" : "")}>
            <TextArea plain block={this.block} prop='value' placeholder="网址" ></TextArea>
            <a  ref={e => this.span = e}  href={this.block.value} target="_blank" className="pos-t-r item-hover visible flex-center size-24 text-1 border  round  cursor bg-hover">
                <Icon icon={LinkSvg}></Icon>
            </a>
        </div>
    }
}