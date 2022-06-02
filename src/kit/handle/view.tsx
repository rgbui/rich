import React from "react";
import { Point } from "../../common/vector/point";
import { Icon } from "../../../component/view/icon";
import { Handle } from ".";
import { Tip } from "../../../component/view/tip";
import { LangID } from "../../../i18n/declare";
import { MouseDragger } from "../../common/dragger";
import { ghostView } from "../../common/ghost";
import { onAutoScroll, onAutoScrollStop } from "../../common/scroll";
import { DragHandleSvg } from "../../../component/svgs";
export class HandleView extends React.Component<{ handle: Handle }>{
    constructor(props) {
        super(props);
        this.handle.view = this;
    }
    get handle() {
        return this.props.handle;
    }
    el: HTMLElement;
    private onMousedown(event: MouseEvent)
    {
        if (this.toolTip) this.toolTip.close();
        this.handle.isDown = true;
        this.handle.isDrag = false;
        var self = this;
        if (event) {
            self.handle.dragBlocks = [];
            if (self.handle.kit.operator.currentSelectedBlocks.exists(c => c.find(g => g == self.handle.handleBlock, true) ? true : false)) {
                var cs = self.handle.kit.operator.currentSelectedBlocks.map(c => c.handleBlock);
                cs.each(c => {
                    if (!self.handle.dragBlocks.some(s => s == c)) self.handle.dragBlocks.push(c)
                });
            } else self.handle.dragBlocks = [self.handle.handleBlock];
            if (self.handle.dragBlocks.some(s => s.isFreeBlock)) {
                self.handle.kit.picker.onPicker(self.handle.dragBlocks);
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
                        self.handle.onDropOverBlock(self.handle.kit.page.getBlockByMouseOrPoint(ev), ev);
                        ghostView.move(Point.from(ev));
                        onAutoScroll({ el: self.handle.kit.page.root, feelDis: 100, dis: 100, point: Point.from(ev) })
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
    handleEle: HTMLElement;
    toolTip: Tip;
    render() {
        return <div>
            <div className='shy-selector-bar'
                ref={e => this.handleEle = e}
                onMouseDown={e => this.onMousedown(e.nativeEvent)}>
                <Tip placement='left' ref={e => { this.toolTip = e; }} id={LangID.bar} >
                    <span>
                        <Icon icon={DragHandleSvg} size={14}></Icon>
                    </span>
                </Tip>
            </div>
        </div>
    }
}