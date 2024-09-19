import React, { CSSProperties } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";
import { Matrix } from "../../../src/common/matrix";
import { Rect } from "../../../src/common/vector/point";
import { GridMap } from "../../../src/page/grid";
import { Tip } from "../../../component/view/tooltip/tip";
import { MouseDragger } from "../../../src/common/dragger";
import { BlockDirective, BlockRenderRange } from "../../../src/block/enum";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { lst } from "../../../i18n/store";
import { BlockChildKey, BlockUrlConstant } from "../../../src/block/constant";
import "./style.less";

@url('/board')
export class Board extends Block {
    @prop()
    viewHeight: number = 300;
    isAutoCreateMind: boolean = false;
    get childsOffsetMatrix() {
        var matrix = new Matrix();
        if (this.el) {
            var p = this.page.getDocRelativePoint(this, this.getVisibleContentBound().leftTop);
            matrix.translate(p.x, p.y);
        }
        return matrix;
    }
    init() {
        this.gridMap = new GridMap(this)
        this.registerPropMeta('boardOffsetMatrix', Matrix, false, (v) => {
            try {
                return new Matrix(v)
            }
            catch (ex) {
                console.trace(v);
                this.page.onError(ex);
                return new Matrix(v);
            }
        }, (v) => v.getValues())
    }
    async didMounted() {
        await this.onBlockReloadData(async () => {
            await this.loadBoard();
        });
    }
    getResolveContent(this: Block) {
        return lst('白板')
    }
    async loadBoard() {
        if (this.createSource == 'InputBlockSelector') {
            if (this.isAutoCreateMind) {
                this.page.onAction('autoCreateMind',
                    async () => {
                        var ma = new Matrix();
                        ma.translate(this.el.clientWidth / 2, this.el.clientHeight / 2)
                        var newBlock = await this.page.createBlock(BlockUrlConstant.Mind, {
                            matrix: ma.getValues()
                        }, this, 0, BlockChildKey.childs);
                        newBlock.mounted(() => {
                            this.page.kit.picker.onPicker([newBlock], { merge: true })
                        })
                        this.page.snapshoot.merge();
                    },
                    {

                    }
                )
            }
        }
    }
    getVisibleContentBound(): Rect {
        var el = this.el.querySelector('.sy-board-canvas') as HTMLElement;
        return Rect.fromEle(el);
    }
    @prop()
    border: 'border' | 'none' = 'border';
    async onGetContextMenus() {
        var menus = await super.onGetContextMenus();
        var cat = menus.findIndex(m => m.name == BlockDirective.comment);
        if (cat > -1) {
            menus.splice(cat, 0, {
                name: 'border',
                type: MenuItemType.switch,
                checked: this.border == 'none' ? false : true,
                text: lst('边框'),
                icon: { name: "byte", code: 'rectangle-one' }
            }, { type: MenuItemType.divide })
        }
        var c = menus.find(c => c.name == 'color');
        if (c) {
            var cd = c.childs.findIndex(g => g.name == 'fontColor');
            c.childs = c.childs.slice(cd + 2);
        }
        var dat = menus.findIndex(c => c.name == BlockDirective.delete);
        if (dat > -1) {
            menus.splice(dat + 1, 0, { type: MenuItemType.divide }, {
                type: MenuItemType.help,
                text: lst('了解如何使用白板块'),
                url: window.shyConfig?.isUS ? "https://help.shy.red/page/78#h9qoXmdsNTEHcPtjEiyah1" : "https://help.shy.live/page/2009#3SRDiGyXURubpTNPhYjbDR"
            })
        }
        return menus;
    }
    async onContextMenuInput(this: Block, item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'border') {
            await this.onUpdateProps({ border: item.checked ? "border" : "none" }, { range: BlockRenderRange.self });
        }
        else await super.onContextMenuInput(item);
    }
}

@view('/board')
export class BoardView extends BlockView<Board> {
    onResize(event: React.MouseEvent) {
        event.stopPropagation();
        var height = this.block.viewHeight;
        MouseDragger({
            event,
            moving: (e, d, end) => {
                var dy = e.clientY - event.clientY;
                var h = height + dy;
                if (h < 60) h = 60;
                this.block.viewHeight = h;
                if (end) {
                    this.block.onManualUpdateProps(
                        { viewHeight: height },
                        { viewHeight: h }
                    );
                }
                else this.forceUpdate()
            }
        })
    }
    renderView() {
        var style: CSSProperties = {}
        return <div className="sy-board"
            style={this.block.visibleStyle}>
            <div className={'sy-board-box '}
                style={this.block.contentStyle}>
                <div className={"relative sy-board-canvas round " + (this.block.border == 'border' ? "border-light" : "border-light-hover")}
                    style={{
                        height: this.block.viewHeight,
                        overflow: 'hidden'
                    }}>
                    <div className="sy-board-content " style={style} ><ChildsArea childs={this.block.childs}></ChildsArea>
                    </div>
                    {this.block.isCanEdit() && <Tip text={'拖动调整高度'}><div className="sy-board-resize visible round item-light-hover" onMouseDown={e => this.onResize(e)}></div></Tip>}
                </div>
            </div>
            {this.renderComment()}
        </div >
    }
}

