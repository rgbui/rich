import React from "react";
import { Rect } from "../../src/common/point";
import { Icon } from "../icon";
import { Switch } from "../switch";
import { MenuBox } from "./box";
import { MenuItemType, MenuItemTypeValue } from "./declare";
export class MenuItem extends React.Component<{ item: MenuItemType, deep: number, select: (item: MenuItemType, event?: MouseEvent) => void }>{
    el: HTMLElement;
    mousedown(item: MenuItemType, event: MouseEvent) {
        this.props?.select(item, event);
    }
    change(checked: boolean, item: MenuItemType) {
        item.checked = checked;
        this.props?.select(item);
    }
    hover: boolean = false;
    mouseenter(item: MenuItemType, event: MouseEvent) {
        this.hover = true;
        this.forceUpdate(() => {
            if (this.el && this.props.item?.childs?.length > 0 && this.menubox) {
                var rect = Rect.from(this.el.getBoundingClientRect());
                this.menubox.open({
                    roundArea: rect,
                    direction: 'right',
                    relativePoint: rect.leftTop,
                    dist: -10
                });
            }
        });
    }
    mouseleave(item: MenuItemType, event: MouseEvent) {
        this.hover = false;
        this.forceUpdate();
    }
    menubox: MenuBox;
    render() {
        var item = this.props.item;
        return <div
            onMouseLeave={e => this.mouseleave(item, e.nativeEvent)}
            onMouseEnter={e => this.mouseenter(item, e.nativeEvent)}
            className={'shy-menu-box-item' + (this.hover ? " hover" : "")}
            ref={e => this.el = e}>
            {(item.type == MenuItemTypeValue.item || !item.type) && <a className='shy-menu-box-item-option'
                onMouseDown={e => this.mousedown(item, e.nativeEvent)}>
                <Icon icon={item.icon} size={item.iconSize ? item.iconSize : 17}></Icon>
                <span className='sy-ws-item-page-text'>{item.text}</span>
                {item.label && <label>{item.label}</label>}
                {item.childs && item.childs.length > 0 && <Icon icon='arrow-right:sy'></Icon>}
            </a>}
            {item.type == MenuItemTypeValue.divide && <a className='shy-menu-box-item-divide'></a>}
            {item.type == MenuItemTypeValue.text && <a className='shy-menu-box-item-text'>{item.text}</a>}
            {item.type == MenuItemTypeValue.switch && <a className='shy-menu-box-item-switch'><span>{item.text}</span><Switch onChange={e => this.change(e, item)} checked={item.checked ? item.checked : false}></Switch></a>}
            {item?.childs?.length > 0 && this.hover && <MenuBox select={this.props.select} items={item.childs} ref={e => this.menubox = e} deep={this.props.deep}></MenuBox>}
        </div>
    }
}