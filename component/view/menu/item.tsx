import React from "react";
import { Rect } from "../../../src/common/vector/point";
import { Button } from "../button";
import { Icon } from "../icon";
import { Input } from "../input";
import { Switch } from "../switch";
import { MenuBox } from "./box";
import { MenuItemType, MenuItemTypeValue } from "./declare";
export class MenuItem extends React.Component<{
    item: MenuItemType,
    deep: number,
    select: (item: MenuItemType, event?: MouseEvent) => void,
    update: (item: MenuItemType) => void
}>{
    el: HTMLElement;
    mousedown(item: MenuItemType, event: MouseEvent) {
        if (item.disabled != true) this.props?.select(item, event);
    }
    checked(checked: boolean, item: MenuItemType) {
        item.checked = checked;
        this.forceUpdate();
        this.props?.update(item);
    }
    input(value: any, item: MenuItemType) {
        item.value = value;
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
        if (item.visible == false) return <></>
        return <div
            onMouseLeave={e => this.mouseleave(item, e.nativeEvent)}
            onMouseEnter={e => this.mouseenter(item, e.nativeEvent)}
            className={'shy-menu-box-item' + (this.hover ? " hover" : "")}
            ref={e => this.el = e}>
            {(item.type == MenuItemTypeValue.item || !item.type) && <a className={'shy-menu-box-item-option' + (item.disabled == true ? " disabled" : "")}
                onMouseUp={e => this.mousedown(item, e.nativeEvent)}>
                {item.render && item.render(item)}
                {!item.render && <>{item.icon && <Icon icon={item.icon} size={item.iconSize ? item.iconSize : 17}></Icon>}
                    <span className='shy-ws-item-page-text'>{item.text}</span>
                    {item.label && <label>{item.label}</label>}
                    {item.childs && item.childs.length > 0 && <Icon icon='arrow-right:sy'></Icon>}
                </>}
            </a>}
            {item.type == MenuItemTypeValue.divide && <a className='shy-menu-box-item-divide'></a>}
            {item.type == MenuItemTypeValue.text && <a className='shy-menu-box-item-text'>{item.text}</a>}
            {item.type == MenuItemTypeValue.switch && <a className='shy-menu-box-item-switch'><span>{item.text}</span><Switch onChange={e => this.checked(e, item)} checked={item.checked ? item.checked : false}></Switch></a>}
            {item.type == MenuItemTypeValue.input && <div className="shy-menu-box-item-input"><Input value={item.value} onEnter={e => this.input(e, item)} onChange={e => item.value = e} placeholder={item.text}></Input></div>}
            {item.type == MenuItemTypeValue.button && <div className="shy-menu-box-item-button"><Button block onClick={e => this.mousedown(item, e.nativeEvent)}>{item.text}</Button></div>}
            {item?.childs?.length > 0 && this.hover && <MenuBox select={this.props.select} update={this.props.update} items={item.childs} ref={e => this.menubox = e} deep={this.props.deep}></MenuBox>}
        </div>
    }
}