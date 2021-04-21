import React from "react";
import { createPortal } from "react-dom";
import { Point } from "../../common/point";
import { Icon } from "../../component/icon";
import { Page } from "../../page";
import { BlockSelectorData } from "./data";

export class BlockSelector extends React.Component<{ page: Page }> {
    private node: HTMLElement;
    constructor(props) {
        super(props);
        this.node = document.body.appendChild(document.createElement('div'));
    }
    get page() {
        return this.props.page;
    }
    filterSelectorData() {
        var bs = BlockSelectorData.map(b => {
            return {
                ...b,
                childs: b.childs.findAll(g => g.label.startsWith(this.command) || g.labels.exists(c => c.startsWith(this.command)))
            }
        });
        bs.removeAll(g => g.childs.length == 0);
        return bs;
    }
    filterBlocks() {
        var cs = [];
        this.filterSelectorData().each(c => {
            cs.addRange(c.childs);
        });
        return cs;
    }
    renderSelectors() {
        let i = 0;
        return BlockSelectorData.map(group => {
            return <div className='sy-block-selector-group' key={group.text}>
                <div className='sy-block-selector-group-head'><span>{group.text}</span></div>
                <div className='sy-block-selector-group-blocks'>{
                    group.childs.map((child, index) => {
                        return <div
                            className={'sy-block-selector-group-block ' + (i + index == this.selectIndex ? 'selected' : '')}
                            key={child.url}
                            onMouseEnter={e => {
                                this.selectIndex = i + index;
                                this.forceUpdate();
                            }}
                            onMouseDown={e => this.onSelect(child)}
                        > {child.pic}
                            <div className='sy-block-selector-group-block-info'>
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
            {this.visible && <div className='sy-block-selector'
                style={style}>{this.renderSelectors()}</div>}
        </div>, this.node);
    }
    select: (block: Record<string, any>) => void;
    onSelect(block?) {
        if (!block) block = this.selectBlockData;
        try {
            if (typeof this.select == 'function')
                this.select(block);
        }
        catch (ex) {
            this.page.onError(ex);
        }
        finally {
            delete this.select;
            this.visible = false;
            this.forceUpdate();
        }
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
        this.selectIndex = 0;
        this.visible = true;
        delete this.select;
        this.forceUpdate();
    }
    onInputFilter(text: string) {
        var cs = text.match(/(\/|、)[^\s]+$/g);
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
        var b = this.filterBlocks[this.selectIndex];
        return b;
    }
    close() {
        this.visible = false;
        this.forceUpdate();
    }
    /**
     * 向上选择内容
     */
    keydown() {
        this.selectIndex -= 1;
        this.forceUpdate();
    }
    /**
     * 向下选择内容
     */
    keyup() {
        this.selectIndex += 1;
        this.forceUpdate();
    }
    componentWillUnmount() {
        if (this.node) this.node.remove()
    }
    interceptKey(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowDown':
                this.keydown();
                return true;
            case 'ArrowUp':
                this.keyup();
                return true;
            case 'Enter':
                this.onSelect();
                return true;
        }
    }
}