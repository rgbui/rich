import React from "react";
import { PopoverPosition, Rect } from "../../src/common/point";
import { Icon } from "../icon";
import { MenuItemType } from "./declare";
export class MenuBox extends React.Component<{ items: MenuItemType[], deep: number, select: (item: MenuItemType, event: MouseEvent) => void }>{
    render() {
        return <div className='sy-menu-box'>
            {this.props.items.map((item, index) => {
                return <MenuItem key={index} item={item} deep={this.props.deep + 1} select={this.props.select} ></MenuItem>
            })}
        </div>
    }
    open(pos: PopoverPosition) {

    }
}
export class MenuItem extends React.Component<{ item: MenuItemType, deep: number, select: (item: MenuItemType, event: MouseEvent) => void }>{
    el: HTMLElement;
    mousedown(item: MenuItemType, event: MouseEvent) {
        this.props.select(item, event);
    }
    hover: boolean = false;
    mouseenter(item: MenuItemType, event: MouseEvent) {
        this.hover = true;
        this.forceUpdate();
        if (this.el && this.props.item?.childs?.length > 0 && this.menubox) {
            var rect = Rect.from(this.el.getBoundingClientRect());
            this.menubox.open({ roundArea: rect });
        }
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
            onMouseEnter={e => this.mouseenter(item, e.nativeEvent)} className={'sy-menu-box-item' + (this.hover ? " hover" : "")} ref={e => this.el = e}>
            {(item.type == 'item' || !item.type) && <a className='sy-menu-box-item-option'

                onMouseDown={e => this.mousedown(item, e.nativeEvent)}>
                <Icon icon={item.icon} size={17}></Icon>
                <span>{item.text}</span>
                {item.label && <label>{item.label}</label>}
                {item.childs && item.childs.length > 0 && <Icon icon='arrow-right:sy'></Icon>}
            </a>}
            {item.type == 'divide' && <a className='sy-menu-box-item-divide'></a>}
            {item.type == 'text' && <a className='sy-menu-box-item-text'>{item.text}</a>}
            {item?.childs.length > 0 && this.hover && <MenuBox select={this.props.select} items={item.childs} ref={e => this.menubox = e} deep={this.props.deep}></MenuBox>}
        </div>
    }
}