import React from "react";
import ReactDOM from "react-dom";
import { Singleton } from "../../component/lib/Singleton";
import { LangID } from "../../i18n/declare";
import { Sp } from "../../i18n/view";
import { KeyboardCode } from "../../src/common/keys";
import { Point, Rect, RectUtility } from "../../src/common/vector/point";
import { InputTextPopSelector } from "../common/input.pop";
import { PopoverPosition } from "../popover/position";
import { BlockSelectorItem } from "./delcare";
import { blockStore } from "./store";

class BlockSelector extends InputTextPopSelector {
    private get filterSelectorData() {
        return blockStore.findAll(this.command);
    }
    private get filterBlocks() {
        return blockStore.findAllBlocks(this.command);
    }
    private get isSelectIndex() {
        return this.selectIndex >= 0 && this.selectIndex < this.filterBlocks.length;
    }
    private renderSelectors() {
        var i = -1;
        var fsd = this.filterSelectorData;
        if (fsd.length == 0) {
            return <div className='shy-block-selector-no-data'>
                <Sp id={LangID.blockSelectorNoData}></Sp>
            </div>
        }
        return fsd.map((group, g) => {
            return <div className='shy-block-selector-group' key={group.text}>
                <div className='shy-block-selector-group-head'><span>{group.text}</span></div>
                <div className='shy-block-selector-group-blocks'>{
                    group.childs.map((child, index) => {
                        i += 1;
                        let j = i;
                        return <div
                            className={'shy-block-selector-group-block ' + (j == this.selectIndex ? 'selected' : '')}
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
                        >{child.pic}
                            <div className='shy-block-selector-group-block-info'>
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
        return <div>
            {this.visible && <div className='shy-block-selector'
                style={style}>{this.renderSelectors()}</div>}
        </div>
    }
    private onSelect(block?: BlockSelectorItem) {
        if (typeof this._select == 'function') this._select(block, this.getFilterText(this.inputValue))
        this.close();
    }
    private visible: boolean = false;
    private pos: Point = new Point(0, 0);
    private round: Rect;
    private command: string = '';
    private selectIndex: number = 0;
    private _select: (block: BlockSelectorItem, matchValue: string) => void;
    async open(round: Rect, text: string, callback: BlockSelector['_select'], options: {}) {
        var cs = text.match(/(\/|、)[^\s]*$/g);
        if (!(cs && cs[0])) {
            this.close();
            return false;
        }
        this.round = round;
        this.pos = round.leftBottom;
        if (this.visible == false) {
            this.selectIndex = 0;
        }
        this.visible = true;
        await blockStore.import();
        this.inputFilter(text);
        this._select = callback;
        return this.visible;
    }
    private inputValue: string;
    private previsible: boolean = false;
    private inputFilter(text: string) {
        this.inputValue = text;
        var cs = text.match(/(\/|、)[^\s]*$/g);
        var command = cs ? cs[0] : "";
        if (command) {
            command = command.replace(/、/g, "/");
            this.command = command;
            if (this.selectIndex >= this.filterBlocks.length) {
                this.selectIndex = 0;
            }
            if (this.filterBlocks.length == 0) {
                if (this.previsible == true) {
                    this.previsible = false;
                    this.adjuctPosition();
                }
                else this.close()
            }
            else { this.previsible = true; this.adjuctPosition(); }
        }
        else {
            this.close();
        }
    }
    private adjuctPosition() {
        this.forceUpdate(() => {
            var selectorEl = this.el.querySelector('.shy-block-selector') as HTMLElement;
            if (selectorEl) {
                var b = Rect.fromEle(selectorEl);
                var pos: PopoverPosition = {
                    roundArea: this.round,
                    elementArea: b
                }
                var newPoint = RectUtility.cacPopoverPosition(pos);
                if (!this.pos.equal(newPoint)) {
                    this.pos = newPoint;
                    this.forceUpdate();
                }
            }
        })
    }
    private getFilterText(text): string {
        return text.replace(/(\/|、)[\w \-\u4e00-\u9fa5]*$/g, '');
    }
    private get selectBlockData() {
        var b = this.filterBlocks[this.selectIndex];
        return b;
    }
    onClose() {
        this.close();
    }
    private close() {
        this.command = '';
        if (this.visible == true) {
            this.visible = false;
            this.forceUpdate();
        }
    }
    /**
     * 向上选择内容
     */
    private keydown() {
        if (!this.isSelectIndex) this.selectIndex = -1;
        if (this.selectIndex < this.filterBlocks.length - 1) {
            this.selectIndex += 1;
            this.forceUpdate();
        }
    }
    /**
     * 向下选择内容
     */
    private keyup() {
        if (!this.isSelectIndex) this.selectIndex = this.filterBlocks.length - 1;
        if (this.selectIndex > 0) {
            this.selectIndex -= 1;
            this.forceUpdate();
        }
    }
    private el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        document.addEventListener('mousedown', this.onGlobalMousedown);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onGlobalMousedown);
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
    onGlobalMousedown = (event: MouseEvent) => {
        if (this.visible == true && this.el) {
            var target = event.target as HTMLElement;
            if (this.el.contains(target)) return;
            this.close();
        }
    }
    onKeydown(event: KeyboardEvent) {
        if (this.visible == true) {
            switch (event.key) {
                case KeyboardCode.ArrowDown:
                    this.keydown();
                    return true;
                case KeyboardCode.ArrowUp:
                    this.keyup();
                    return true;
                case KeyboardCode.Enter:
                    var block = this.selectBlockData;
                    this.onSelect(block);
                    return true;
            }
        }
        return false;
    }
}
export async function useBlockSelector() {
    return await Singleton(BlockSelector);
}
