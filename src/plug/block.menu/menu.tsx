import React from "react";
import { createPortal } from "react-dom";
import { Point } from "../../common/point";
import { Icon } from "../../component/icon";
import { Page } from "../../page";
export type SelectorMenuItemType = {
    name?: string,
    type?: 'devide' | 'text' | 'option',
    text?: string,
    icon?: string,
    label?: string,
    childs?: SelectorMenuItemType[]
}

export class SelectorMenu extends React.Component<{ page: Page }>{
    private node: HTMLElement;
    constructor(props) {
        super(props);
        this.node = document.body.appendChild(document.createElement('div'));
    }
    open(event: MouseEvent) {
        this.point = Point.from(event);
        this.visible = true;
        delete this.select;
        console.log('xxx');
        this.forceUpdate();
    }
    close() {
        delete this.select;
        this.visible = false;
        this.forceUpdate();
    }
    select: (item: SelectorMenuItemType, event: MouseEvent) => void;
    private mousedown(item: SelectorMenuItemType, event: MouseEvent) {
        if (typeof this.select == 'function') {
            try {
                this.select(item, event);
            }
            catch (ex) {
                this.props.page.onError(ex);
            }
            finally {

                this.close();
            }
        }
    }
    get isVisible() {
        return this.visible;
    }
    get items() {
        var items: SelectorMenuItemType[] = [];
        items.push({
            name: 'delete',
            icon: "remove:sy",
            text: '删除',
            label: "delete"
        });
        return items;
    }
    private visible: boolean = false;
    private point: Point = new Point(0, 0);

    renderItem(item: SelectorMenuItemType) {
        return <div className='sy-selector-menu-item-box' key={(item.name || '') + (item.type || '')}>
            <div className='sy-selector-menu-item'>
                {(item.type == 'option' || !item.type) && <a className='sy-selector-menu-item-option' onMouseDown={e => this.mousedown(item, e.nativeEvent)}>
                    <Icon icon={item.icon}></Icon><span>{item.text}</span>
                    {item.label && <label>{item.label}</label>}
                    {item.childs && item.childs.length > 0 && <Icon icon='arrow-right:sy'></Icon>}
                </a>}
                {item.type == 'devide' && <a className='sy-selector-menu-item-devide'></a>}
                {item.type == 'text' && <a className='sy-selector-menu-item-text'>{item.text}</a>}
            </div>
            {item.childs && item.childs.length > 0 && <div className='sy-selector-menu-childs'>
                {item.childs.map(it => this.renderItem(it))}
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
                        {this.items.map(g => this.renderItem(g))}
                    </div>
                </div>}
            </div>,
            this.node);
    }
    componentWillUnmount() {
        this.node.remove();
    }
}