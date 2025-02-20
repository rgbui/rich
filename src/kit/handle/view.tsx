import React from "react";
import { Point } from "../../common/vector/point";
import { Icon } from "../../../component/view/icon";
import { Handle } from ".";
import { Tip } from "../../../component/view/tooltip/tip";
import { MouseDragger } from "../../common/dragger";
import { ghostView } from "../../common/ghost";
import { onAutoScroll, onAutoScrollStop } from "../../common/scroll";
import { DragHandleSvg, PlusSvg } from "../../../component/svgs";
import { UA } from "../../../util/ua";
import { Sp } from "../../../i18n/view";
import lodash from "lodash";

export class HandleView extends React.Component<{ handle: Handle }> {
    constructor(props) {
        super(props);
        this.handle.view = this;
    }
    get handle() {
        return this.props.handle;
    }
    private async onPlus(event: React.MouseEvent) {
        this.closeTip();
        var self = this;
        self.handleEle.style.display = 'none';
        if (self.handle.kit.anchorCursor.currentSelectedBlocks.length > 0) {
            var bs = self.handle.kit.page.getAtomBlocks(self.handle.kit.anchorCursor.currentSelectedBlocks);
            var b = bs.findMax(g => g.getVisibleContentBound().bottom);
            if (b) {
                await b.onHandlePlus();
            }
        }
        else if (self.handle.handleBlock) {
            await self.handle.handleBlock.onHandlePlus();
        }
    }
    onMousedown(event: MouseEvent, options?: { isOnlyDrag?: boolean, notDragFun?: (e: MouseEvent) => void }) {
        this.closeTip();
        this.handle.isDown = true;
        this.handle.isDrag = false;
        var self = this;
        if (event) {
            self.handle.dragBlocks = [];
            if (self.handle.kit.anchorCursor.currentSelectedBlocks.exists(c => c.find(g => g == self.handle.handleBlock, true) ? true : false)) {
                var cs = self.handle.kit.anchorCursor.currentSelectedBlocks.map(c => c.handleBlock);
                lodash.remove(cs, c => lodash.isNull(c) || lodash.isUndefined(c));
                cs.each(c => {
                    if (!self.handle.dragBlocks.some(s => s == c))
                        self.handle.dragBlocks.push(c)
                });
            } else if (self.handle.handleBlock) self.handle.dragBlocks = [self.handle.handleBlock];
            if (self.handle.dragBlocks.length == 0) { self.handle.onDropEnd(); return; }
            if (self.handle.dragBlocks.some(s => s.isFreeBlock)) {
                self.handle.kit.anchorCursor.onClearCursor();
                self.handle.kit.picker.onPicker(self.handle.dragBlocks);
                self.handle.onDropEnd();
            }
            else {
                var scrollDiv = self.handle.dragBlocks[0]?.panel?.getScrollDiv();
                if (!scrollDiv) scrollDiv = self.handle.kit.page.getScrollDiv();
                var isCanDrag = self.handle.dragBlocks.every(b => b.isCanDrag);
                MouseDragger<{ item: HTMLElement }>({
                    event,
                    dis: 5,
                    moveStart(ev, data) {
                        if (isCanDrag) {
                            onAutoScrollStop();
                            self.handle.isDrag = true;
                            ghostView.load(self.handle.dragBlocks.map(b => b.contentEl), {
                                background: '#fff',
                                point: Point.from(ev)
                            })
                        }
                    },
                    moving(ev, data, isend) {
                        if (!isend && isCanDrag) {
                            if (ghostView.containEl(ev.target as HTMLElement)) return;
                            self.handle.onDropOverBlock(self.handle.kit.page.getBlockByMouseOrPoint(ev), ev);
                            ghostView.move(Point.from(ev).move(10, 10));
                            onAutoScroll({
                                el: scrollDiv,
                                feelDis: 100,
                                dis: 30,
                                interval: 50,
                                point: Point.from(ev)
                            })
                        }
                    },
                    async moveEnd(ev, isMove, data) {
                        self.handle.isDown = false;
                        if (isCanDrag) onAutoScrollStop();
                        try {
                            if (self.handle.isDrag == true) self.handle.onDropBlock()
                            else {
                                if (options?.isOnlyDrag !== true)
                                    self.handle.onClickBlock(ev);
                                if (typeof options?.notDragFun)
                                    options?.notDragFun(ev)
                            }
                        }
                        catch (ex) {
                            self.handle.kit.emit('error', ex);
                        }
                        finally {
                            console.log('on finally')
                            self.handle.onDropEnd();
                            ghostView.unload();
                        }
                    }
                })
            }
        }
    }
    private closeTip() {
        if (this.toolTip) this.toolTip.close();
        if (this.plusToolTip) this.plusToolTip.close();
    }
    handleEle: HTMLElement;
    toolTip: Tip;
    plusToolTip: Tip;
    render() {
        return <div>
            <div className='shy-selector-bar'
                ref={e => this.handleEle = e}
                style={{
                    // backgroundColor:'red'
                }}
            >
                <Tip placement='bottom' ref={e => { this.plusToolTip = e; }} overlay={<Sp block text={'鼠标点击插入块'} data={{ key: UA.isMacOs ? "option" : "alt" }}>鼠标点击插入块<br />{UA.isMacOs ? "option" : "alt"}点击上面插入块</Sp>} >
                    <span className="shy-selector-bar-plus remark size-24 round flex-center flex-inline" onMouseDown={e => { e.stopPropagation(); this.onPlus(e) }}>
                        <Icon icon={PlusSvg} size={20}></Icon>
                    </span>
                </Tip>
                <Tip placement='bottom' ref={e => { this.toolTip = e; }} overlay={<Sp block text='点击打开菜单'><span><b>点击</b>打开菜单</span><span><b>拖拽</b>可移动位置</span></Sp>}>
                    <span className="shy-selector-bar-plus-drag remark round w-18 h-24 flex-center flex-inline" onMouseDown={e => { e.stopPropagation(); this.onMousedown(e.nativeEvent) }}>
                        <Icon icon={DragHandleSvg} size={16}></Icon>
                    </span>
                </Tip>
            </div>
        </div>
    }
}