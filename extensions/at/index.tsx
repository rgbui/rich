import React from "react";
import { createPortal } from "react-dom";
import { KeyboardCode } from "../../src/common/keys";
import { Point } from "../../src/common/vector/point";
import { EventsComponent } from "../../component/lib/events.component";
import { ReferenceSelectorData } from "./data";

export class AtSelector extends EventsComponent {
    private node: HTMLElement;
    constructor(props) {
        super(props);
        this.node = document.body.appendChild(document.createElement('div'));
    }
    renderSelectors() {
        return ReferenceSelectorData.map(group => {
            return <div className='shy-reference-selector-group' key={group.text}>
                <div className='shy-reference-selector-head'>{group.text}</div>
                <div className='shy-reference-selector-blocks'>{
                    group.childs.map(child => {
                        return <div className='shy-reference-selector-block' key={child.url}>
                            <div className='shy-reference-selector-info'>
                                <span>{child.text}</span>
                                <em>{child.description}</em>
                            </div>
                            <label>{child.label}</label>
                        </div>
                    })
                }</div>
            </div>
        })
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x
        }
        return createPortal(<div>
            {this.visible && <div className='shy-reference-selector' style={style}>{this.renderSelectors()}</div>}
        </div>, this.node);
    }
    private visible: boolean = false;
    private pos: Point = new Point(0, 0);
    private command: string = '';
    private selectIndex: number = 0;
    get isVisible() {
        return this.visible;
    }
    open(point: Point) {
        this.pos = point;
        this.visible = true;
        this.forceUpdate();
    }
    isTriggerOpen(value: string) {
        return value.endsWith('@')
    }
    isTriggerFilter(value: string) {
        if (this.visible) {
            if (/@[\w \-\u4e00-\u9fa5]+$/g.test(value)) return true;
        }
        return false;
    }
    onInputFilter(text: string) {
        var cs = text.match(/@[^\s]+$/g);
        var command = cs[0];
        if (command) {
            this.command = command;
            this.forceUpdate();
        }
        else {
            this.command = '';
            this.close();
        }
    }
    get selectBlockData() {
        return null;
    }
    close() {
        if (this.visible == true) {
            this.visible = false;
            this.forceUpdate();
        }
    }
    /**
     * 向上选择内容
     */
    keydown() {
        if (this.selectIndex > 0)
            this.selectIndex -= 1;
    }
    /**
     * 向下选择内容
     */
    keyup() {
        this.selectIndex += 1;
    }
    componentWillUnmount() {
        if (this.node) this.node.remove()
    }
    interceptKey(event: KeyboardEvent) {
        switch (event.key) {
            case KeyboardCode.ArrowDown:
                this.keydown();
                return true;
            case KeyboardCode.ArrowUp:
                this.keyup();
                return true;
            case KeyboardCode.Enter:
                //this.onSelect();
                return true;
        }
    }
}
export interface AtSelector {
    on(name: 'error', fn: (error: Error) => void);
    emit(name: 'error', error: Error);
}