import React from "react";
import { createPortal } from "react-dom";
import { Point } from "../../src/common/point";
import { Icon } from "../../component/icon";
import duplicate from "../../assert/svg/duplicate.svg";
import loop from "../../assert/svg/loop.svg";
import blockcolor from "../../assert/svg/blockcolor.svg";
import link from "../../assert/svg/link.svg";
import squareplus from "../../assert/svg/squareplus.svg";
import moveTo from '../../assert/svg/moveTo.svg';
import comment from "../../assert/svg/comment.svg";
import trash from "../../assert/svg/trash.svg";
import { SyExtensionsComponent } from "../sy.component";
import { BlockMenuAction, BlockMenuItem } from "./out.declare";
import { BlockSelectorData } from "../block/data";
import { Block } from "../../src/block";
export class BlockMenu extends SyExtensionsComponent {
    private node: HTMLElement;
    constructor(props) {
        super(props);
        this.node = document.body.appendChild(document.createElement('div'));
    }
    private blocks: Block[];
    open(blocks: Block[], event: MouseEvent) {
        this.point = Point.from(event);
        this.visible = true;
        this.blocks = blocks;
        this.forceUpdate();
    }
    close() {
        if (this.visible == true) {
            this.visible = false;
            this.forceUpdate();
        }
    }
    private mousedown(item: BlockMenuItem, event: MouseEvent) {
        try {
            this.emit('select', this.blocks, item, event);
        }
        catch (ex) {
            this.emit('error', ex);
        }
        finally {
            this.close();
        }
    }
    get isVisible() {
        return this.visible;
    }
    get items() {
        var items: BlockMenuItem[] = [];
        items.push({
            name: BlockMenuAction.delete,
            icon: trash,
            text: '删除',
            label: "delete"
        });
        items.push({
            name: BlockMenuAction.copy,
            text: '拷贝',
            label: "ctrl+D",
            icon: duplicate
        });
        items.push({
            text: '转换为',
            icon: loop,
            childs: BlockSelectorData.first().childs.map(c => {
                return {
                    name: BlockMenuAction.trun,
                    text: c.text,
                    label: c.label,
                    icon: c.pic,
                    value: c.url
                }
            })
        });
        items.push({
            name: BlockMenuAction.trunIntoPage,
            text: '转换为页面',
            icon: squareplus
        });
        items.push({
            name: BlockMenuAction.moveTo,
            text: '移到',
            icon: moveTo
        });
        items.push({
            name: BlockMenuAction.link,
            text: '复制链接',
            icon: link
        });
        items.push({
            type: 'devide'
        });
        items.push({
            name: BlockMenuAction.comment,
            text: '评论',
            icon: comment
        });
        items.push({
            type: 'devide'
        });
        items.push({
            name: BlockMenuAction.color,
            text: '颜色',
            icon: blockcolor
        });
        return items;
    }
    private visible: boolean = false;
    private point: Point = new Point(0, 0);
    renderItem(item: BlockMenuItem, index: number) {
        return <div className='sy-selector-menu-item-box' key={(item.name || '') + (item.type || '') + index.toString()}>
            <div className='sy-selector-menu-item'>
                {(item.type == 'option' || !item.type) && <a className='sy-selector-menu-item-option' onMouseDown={e => this.mousedown(item, e.nativeEvent)}>
                    <Icon icon={item.icon} size={17}></Icon>
                    <span>{item.text}</span>
                    {item.label && <label>{item.label}</label>}
                    {item.childs && item.childs.length > 0 && <Icon icon='arrow-right:sy'></Icon>}
                </a>}
                {item.type == 'devide' && <a className='sy-selector-menu-item-devide'></a>}
                {item.type == 'text' && <a className='sy-selector-menu-item-text'>{item.text}</a>}
            </div>
            {item.childs && item.childs.length > 0 && <div className='sy-selector-menu-childs'>
                {item.childs.map((it, i) => this.renderItem(it, i))}
            </div>}
        </div>
    }
    render() {
        var style: Record<string, any> = {};
        style.top = this.point.y;
        style.left = this.point.x;
        return createPortal(
            <div>
                {this.visible == true && <div className='sy-selector-menu'>
                    <div className='sy-selector-menu-cove' onMouseDown={e => this.close()}></div>
                    <div className='sy-selector-menu-box' style={style}>
                        <div className='sy-selector-menu-box-wrapper' >   {this.items.map((g, i) => this.renderItem(g, i))}</div>

                    </div>
                </div>}
            </div>,
            this.node);
    }
    componentWillUnmount() {
        this.node.remove();
    }
}
export interface BlockMenu {
    on(name: 'error', fn: (error: Error) => void);
    emit(name: 'error', error: Error);
    on(name: 'select', fn: (blocks: Block[], item: BlockMenuItem, event: MouseEvent) => void);
    emit(name: 'select', blocks: Block[], item: BlockMenuItem, event: MouseEvent);
}