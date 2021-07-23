import React from "react";
import ReactDOM, { createPortal } from "react-dom";
import { KeyboardCode } from "../../common/keys";
import { Point } from "../../common/point";
import { SyExtensionsComponent } from "../sy.component";
import { BlockSelectorData } from "./data";

export type BlockSelectorItem = {
    url: string,
    text: string
}

export class BlockSelector extends SyExtensionsComponent {
    private node: HTMLElement;
    constructor(props)
    {
        super(props);
        this.node = document.body.appendChild(document.createElement('div'));
    }
    get filterSelectorData() {
        var bs = BlockSelectorData.map(b => {
            return {
                ...b,
                childs: b.childs.findAll(g => g.label.startsWith(this.command) || g.labels.exists(c => c.startsWith(this.command)))
            }
        });
        bs.removeAll(g => g.childs.length == 0);
        return bs;
    }
    get filterBlocks() {
        var cs = [];
        this.filterSelectorData.each(c => {
            cs.addRange(c.childs);
        });
        return cs;
    }
    get isSelectIndex() {
        return this.selectIndex >= 0 && this.selectIndex < this.filterBlocks.length;
    }
    renderSelectors() {
        var i = -1;
        return this.filterSelectorData.map((group, g) => {
            return <div className='sy-block-selector-group' key={group.text}>
                <div className='sy-block-selector-group-head'><span>{group.text}</span></div>
                <div className='sy-block-selector-group-blocks'>{
                    group.childs.map((child, index) => {
                        i += 1;
                        let j = i;
                        return <div
                            className={'sy-block-selector-group-block ' + (j == this.selectIndex ? 'selected' : '')}
                            key={child.url}
                            onMouseEnter={e => {
                                this.selectIndex = j;
                                this.forceUpdate();
                            }}
                            onMouseLeave={e => {
                                this.selectIndex = -1;
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
    onSelect(block?) {
        if (!block) block = this.selectBlockData;
        try {
            this.emit('select', block,this.getFilterText(this.inputValue));
        }
        catch (ex) {
            this.emit('error', ex);
        }
        finally {
            this.close();
        }
    }
    private visible: boolean = false;
    private pos: Point = new Point(0, 0);
    private command: string = '';
    private selectIndex: number = 0;
    get isVisible() {
        return this.visible;
    }
    isTriggerOpen(value: string) {
        return value.endsWith('/') || value.endsWith('、')
    }
    isTriggerFilter(value: string) {
        if (this.visible) {
            if (/(\/|、)[\w \-\u4e00-\u9fa5]+$/g.test(value)) return true;
        }
        return false;
    }
    open(point: Point, text: string) {
        this.pos = point;
        this.selectIndex = 0;
        this.visible = true;
        this.onInputFilter(text);
    }
    private inputValue: string;
    onInputFilter(text: string) {
        this.inputValue = text;
        var cs = text.match(/(\/|、)[^\s]*$/g);
        var command = cs ? cs[0] : "";
        if (command) {
            command = command.replace(/、/g, "/");
            this.command = command;
            if (this.filterBlocks.length == 0) {
                this.close()
            }
            else
                this.forceUpdate();
        }
        else {
            this.command = '';
            this.close();
        }
    }
    getFilterText(text) {
        return text.replace(/(\/|、)[\w \-\u4e00-\u9fa5]*$/g, '');
    }
    get selectBlockData() {
        var b = this.filterBlocks[this.selectIndex];
        return b;
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
        if (!this.isSelectIndex) this.selectIndex = -1;
        if (this.selectIndex < this.filterBlocks.length - 1) {
            this.selectIndex += 1;
            this.forceUpdate();
        }
    }
    /**
     * 向下选择内容
     */
    keyup() {
        if (!this.isSelectIndex) this.selectIndex = this.filterBlocks.length - 1;
        if (this.selectIndex > 0) {
            this.selectIndex -= 1;
            this.forceUpdate();
        }
    }
    componentWillUnmount() {
        if (this.node) this.node.remove()
    }
    el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
    }
    componentDidUpdate() {
        var el = this.el.querySelector('.selected') as HTMLElement;
        if (el) {
            el.scrollIntoView({
                block: "nearest",
                inline: "nearest"
            });
        }
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
                this.onSelect();
                return true;
        }
    }
}
export interface BlockSelector {
    on(name: 'error', fn: (error: Error) => void);
    emit(name: 'error', error: Error);
    on(name: 'select', fn: (item: BlockSelectorItem,value:string) => void);
    emit(name: 'select', item: BlockSelectorItem,value:string);
}