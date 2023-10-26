import React from "react";
import { ChevronDownSvg, DotsSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";

@url('/button/drops')
export class DropButtons extends Block {
    @prop()
    drops: { text: string, action: string, actionProps?: Record<string, any> }[] = [];
    openEditDrop(drop: ArrayOf<DropButtons['drops']>, event: React.MouseEvent) {
        event.stopPropagation();
    }
}

@view('/button/drops')
export class DropButtonsView extends BlockView<DropButtons>{
    renderView()  {
        return <div className="relative">
            <div className="flex"><span></span><span><Icon size={18} icon={ChevronDownSvg}></Icon></span></div>
            <div className="pos">{this.block.drops.map((drop, index) => {
                return <div className="flex min-h-24 visible-hover" key={index}>
                    <span className="flex-auto">{drop.text}</span>
                    <span className="flex-fixed visible" onMouseDown={e => this.block.openEditDrop(drop, e)}><Icon size={18} icon={DotsSvg}></Icon></span>
                </div>
            })}</div>
        </div>
    }
}