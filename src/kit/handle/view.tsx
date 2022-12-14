import React from "react";
import { Point } from "../../common/vector/point";
import { Icon } from "../../../component/view/icon";
import { Handle } from ".";
import { Tip } from "../../../component/view/tooltip/tip";
import { LangID } from "../../../i18n/declare";
import { MouseDragger } from "../../common/dragger";
import { ghostView } from "../../common/ghost";
import { onAutoScroll, onAutoScrollStop } from "../../common/scroll";
import { DragHandleSvg, PlusSvg } from "../../../component/svgs";

export class HandleView extends React.Component<{ handle: Handle }>{
    constructor(props) {
        super(props);
        this.handle.view = this;
    }
    get handle() {
        return this.props.handle;
    }
    // el: HTMLElement;
    private async onPlus(event: React.MouseEvent) {
        this.closeTip();
        event.stopPropagation();
        var self = this;
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
    private onMousedown(event: MouseEvent) {
        this.closeTip();
        this.handle.isDown = true;
        this.handle.isDrag = false;
        var self = this;
        if (event) {
            self.handle.dragBlocks = [];
            if (self.handle.kit.anchorCursor.currentSelectedBlocks.exists(c => c.find(g => g == self.handle.handleBlock, true) ? true : false)) {
                var cs = self.handle.kit.anchorCursor.currentSelectedBlocks.map(c => c.handleBlock);
                cs.each(c => {
                    if (!self.handle.dragBlocks.some(s => s == c))
                        self.handle.dragBlocks.push(c)
                });
            } else self.handle.dragBlocks = [self.handle.handleBlock];
            if (self.handle.dragBlocks.some(s => s.isFreeBlock)) {
                self.handle.kit.picker.onPicker(self.handle.dragBlocks);
                window.getSelection().collapse(self.handle.kit.page.viewEl)
                MouseDragger<{ item: HTMLElement }>({
                    event,
                    dis: 5,
                    move(ev, data) {
                        self.handle.kit.picker.onMove(Point.from(event), Point.from(ev))
                    },
                    async moveEnd(ev, isMove, data) {
                        self.handle.isDown = false;
                        if (isMove) self.handle.kit.picker.onMoveEnd(Point.from(event), Point.from(ev))
                        else await self.handle.onClickBlock(ev);
                    }
                })
            }
            else {
                MouseDragger<{ item: HTMLElement }>({
                    event,
                    dis: 5,
                    moveStart(ev, data) {
                        onAutoScrollStop();
                        self.handle.isDrag = true;
                        ghostView.load(self.handle.dragBlocks.map(b => b.contentEl), {
                            background: '#fff',
                            point: Point.from(ev)
                        })
                    },
                    moving(ev, data, isend) {
                        if (ghostView.containEl(ev.target as HTMLElement)) return;
                        self.handle.onDropOverBlock(self.handle.kit.page.getBlockByMouseOrPoint(ev), ev);
                        ghostView.move(Point.from(ev).move(10, 10));
                        onAutoScroll({ el: self.handle.kit.page.root, feelDis: 100, dis: 30, interval: 50, point: Point.from(ev) })
                    },
                    async moveEnd(ev, isMove, data) {
                        onAutoScrollStop();
                        try {
                            if (self.handle.isDrag == true) await self.handle.onDropBlock()
                            else await self.handle.onClickBlock(ev);
                        }
                        catch (ex) {
                            self.handle.kit.emit('error', ex);
                        }
                        finally {
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
            >
                <Tip placement='bottom' ref={e => { this.plusToolTip = e; }} overlay={'点击下面插入块'} >
                    <span onClick={e => this.onPlus(e)}>
                        <Icon icon={PlusSvg} size={16}></Icon>
                    </span>
                </Tip>
                <Tip placement='bottom' ref={e => { this.toolTip = e; }} id={LangID.bar} >
                    <span onMouseDown={e => this.onMousedown(e.nativeEvent)}>
                        <Icon icon={DragHandleSvg} size={14}></Icon>
                    </span>
                </Tip>
            </div>
        </div>
    }
}