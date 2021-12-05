import React from "react";
import { Point } from "../../common/point";
import { Icon } from "../../../component/view/icon";
import { Handle } from ".";
import { Tip } from "../../../component/view/tip";
import { LangID } from "../../../i18n/declare";
import DragHandle from "../../assert/svg/DragHandle.svg";
import { MouseDragger } from "../../common/dragger";
import { ghostView } from "../../common/ghost";
export class HandleView extends React.Component<{ handle: Handle }>{
    constructor(props) {
        super(props);
        this.handle.view = this;
    }
    get handle() {
        return this.props.handle;
    }
    el: HTMLElement;
    isDown: Boolean;
    isDrag: boolean = false;
    private onMousedown(event: MouseEvent) {
        if (this.toolTip) this.toolTip.close();
        this.isDown = true;
        this.isDrag = false;
        var self = this;
        if (event) {
            MouseDragger<{ item: HTMLElement }>({
                event,
                dis: 5,
                moveStart(ev, data) {
                    if (self.handle.kit.explorer.hasSelectionRange && self.handle.handleBlock && self.handle.kit.explorer.selectedBlocks.exists(c => c.find(g => g == self.handle.handleBlock, true) ? true : false)) {
                        var cs = self.handle.kit.explorer.selectedBlocks.map(c => c.handleBlock);
                        cs.each(c => {
                            if (!self.handle.dragBlocks.some(s => s == c)) self.handle.dragBlocks.push(c)
                        });
                    }
                    else self.handle.dragBlocks = [self.handle.handleBlock]
                    self.isDrag = true;
                    ghostView.load(self.handle.dragBlocks.map(b => b.el), { point: Point.from(ev) })
                },
                moving(ev, data, isend) {
                    ghostView.move(Point.from(ev));
                },
                moveEnd(ev, isMove, data) {
                    try {
                        if (self.isDrag == true) self.handle.onDropBlock()
                        else self.handle.onClickBlock(ev);
                    }
                    catch (ex) {
                        self.handle.kit.emit('error', ex);
                    }
                    finally {
                        self.isDrag = false;
                        self.isDown = false;
                        self.handle.onDropEnd();
                        ghostView.unload();
                    }
                }
            })
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
                        <Icon icon={DragHandle} size={14}></Icon>
                    </span>
                </Tip>
            </div>
        </div>
    }
}