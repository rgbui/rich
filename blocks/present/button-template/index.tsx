import React from "react";
import { TrashSvg } from "../../../component/svgs";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Icon } from "../../../component/view/icon";


@url('/button/template')
export class ButtonTemplate extends Block {

}

@view('/button/template')
export class ButtonTemplateView extends BlockView<ButtonTemplate>{
    renderView() {
        return <div className="bg-error round flex" onClick={e => {
            this.block.onDelete();
        }}>
            <span>已废弃</span>
            <span className="size-20 flex-center" >
                <Icon icon={TrashSvg}></Icon>
            </span>
        </div>
    }
}