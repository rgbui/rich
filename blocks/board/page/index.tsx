import React from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";
import { GridMap } from "../../../src/page/grid";
import { Icon } from "../../../component/view/icon";
import { DotsSvg } from "../../../component/svgs";
import { Tip } from "../../../component/view/tooltip/tip";
import { BoardPointType, BoardBlockSelector } from "../../../src/block/partial/board";
import lodash from "lodash";
import { BlockUrlConstant } from "../../../src/block/constant";
import { ActionDirective } from "../../../src/history/declare";
import { Rect } from "../../../src/common/vector/point";

@url('/board/page/card')
export class PageCard extends Block {
    @prop()
    fixedWidth: number = 300;
    @prop()
    fixedHeight: number = 500;
    init() {
        this.gridMap = new GridMap(this)
    }
    getBlockBoardSelector(this: Block, types?: BoardPointType[]): BoardBlockSelector[] {
        var pickers = super.getBlockBoardSelector(...arguments);
        lodash.remove(pickers, g => g.type == BoardPointType.rotatePort)
        return pickers;
    }
    getVisibleBound() {
        var fs = this.fixedSize;
        var rect = new Rect(0, 0, fs.width, fs.height);
        rect = rect.transformToRect(this.globalWindowMatrix);
        return rect;
    }
    getVisibleContentBound() {
        return this.getVisibleBound()
    }
}

@view('/board/page/card')
export class PageCardView extends BlockView<PageCard> {
    mousedown(event: React.MouseEvent) {
        if (this.block.childs.length == 0) {
            event.stopPropagation()
            this.block.page.onAction(ActionDirective.onCreateBlockByEnter, async () => {
                var newBlock = await this.block.page.createBlock(BlockUrlConstant.TextSpan, {}, this.block);
                newBlock.mounted(() => {
                    this.block.page.kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
                })
            });
        }
    }
    renderView() {
        var style = this.block.visibleStyle;
        style.width = this.block.fixedWidth || 300;
        style.height = this.block.fixedHeight || 500;
        return <div style={style} className="visible-hover">
            <div className='bg-white shadow-s border-light round w100 h100' >
                <div className="h100 relative">
                    <div className="visible size-30 flex-center pos-t-r "
                        onMouseDown={async e => {
                            e.stopPropagation();
                            var ele = e.currentTarget as HTMLElement;
                            ele.classList.remove('visible');
                            try {
                                await this.block.onContextmenu(e.nativeEvent)
                            }
                            catch (ex) {

                            }
                            finally {
                                ele.classList.add('visible');
                            }
                        }}
                        style={{ top: -30 }}>
                        <div className="size-24 flex-center cursor round   bg-white shadow-s" >
                            <Tip text='属性'><span className="flex-center item-hover size-24 ">
                                <Icon size={18} icon={DotsSvg}></Icon>
                            </span></Tip>
                        </div>
                    </div>

                    <div className="padding-20 border-box  h100  padding-b-20 flex-auto overflow-y" onMouseDown={e => this.mousedown(e)}>
                        <ChildsArea childs={this.block.childs}></ChildsArea>
                    </div>
                </div>
            </div>
            {this.renderComment()}
        </div>
    }
}