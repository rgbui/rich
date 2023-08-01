import React from "react";
import { Tab } from ".";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { TextSpanArea } from "../../../src/block/view/appear";
import { lst } from "../../../i18n/store";

@url('/tab/item')
export class TabItem extends Block {
    partName: string = 'tab-item';
    get myTab() {
        return this.parent as Tab
    }
    get handleBlock(): Block {
        return this.myTab
    }
    get isAllowDrop() {
        return false;
    }

    async getMd() {
        var ps: string[] = [];
        ps.push((await this.childs.asyncMap(async b => await b.getMd())).join(""))
        ps.push((await this.otherChilds.asyncMap(async b => await b.getMd())).join(""))
        return ps.join('  \n');
    }

}
@view('/tab/item')
export class TabItemView extends BlockView<TabItem>{
    render() {
        return <div
            onContextMenu={e => this.block.myTab.onTabeItemContextmenu(e, this.block.at)}
            onClick={e => this.block.myTab.changeTabIndex(this.block.at)}
            onMouseDown={e => this.block.myTab.onDraggerItem(e, this.block.at)}
            className={'sy-block-tab-item' + (this.block.at == this.block.myTab.tabIndex ? " hover" : "")}
            style={this.block.visibleStyle}>
            <div className="sy-block-tab-item-content">
                <TextSpanArea placeholderEmptyVisible placeholder={lst("标签项")} block={this.block}></TextSpanArea>
            </div>
        </div>
    }
}