
import React from "react";
import { MenuPanel } from ".";
import { Rect } from "../../../src/common/vector/point";
import { CheckSvg, ChevronDownSvg, DragHandleSvg } from "../../svgs";
import { Button } from "../button";
import { Icon } from "../icon";
import { Input } from "../input";
import { Switch } from "../switch";
import { ToolTip } from "../tooltip";
import { MenuBox } from "./box";
import { MenuItem, MenuItemType } from "./declare";
import { MenuView } from "./menu";

export class MenuItemView extends React.Component<{
    item: MenuItem,
    deep: number,
    parent: MenuPanel<any> | MenuView,
    select: (item: MenuItem, event?: MouseEvent) => void,
    input: (item: MenuItem) => void,
    click: (item: MenuItem, event?: React.MouseEvent, clickName?: string) => void
}>{
    el: HTMLElement;
    select(item: MenuItem, event?: MouseEvent) {
        if (item.disabled != true) this.props?.select(item, event);
    }
    checked(checked: boolean, item: MenuItem) {
        item.checked = checked;
        this.forceUpdate();
        this.props?.input(item);
    }
    input(e: string, item: MenuItem) {
        item.value = e;
        this.props?.input(item);
    }
    click(item: MenuItem, event?: React.MouseEvent, name?: string) {
        this.props?.click(item, event, name);
    }
    hover: boolean = false;
    mouseenter(item: MenuItem, event: MouseEvent) {
        if (this.props.parent.free) return;
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
    mouseleave(item: MenuItem, event: MouseEvent) {
        if (this.props.parent.free) return;
        this.hover = false;
        this.forceUpdate();
    }
    openSelectMenu(item: MenuItem, event: React.MouseEvent) {

    }
    menubox: MenuBox;
    render() {
        var item = this.props.item;
        if (item.visible == false) return <></>
        if (item.type == MenuItemType.container) return <div style={{ maxHeight: item.containerHeight || undefined }} className="shy-menu-box-item-container">
            {item.childs.map((item, i) => {
                return <MenuItemView parent={this.props.parent} key={i} select={this.props.select} click={this.props.click} input={this.props.input} item={this.props.item} deep={this.props.deep}></MenuItemView>
            })}
        </div>
        return <div
            onMouseLeave={e => this.mouseleave(item, e.nativeEvent)}
            onMouseEnter={e => this.mouseenter(item, e.nativeEvent)}
            className={'shy-menu-box-item' + (this.hover ? " hover" : "")}
            ref={e => this.el = e}>
            {(item.type == MenuItemType.item || !item.type) && <ToolTip overlay={item.overlay} placement={item.placement || 'right'} > <a className={'shy-menu-box-item-option' + (item.disabled == true ? " disabled" : "")}
                onMouseUp={e => this.select(item, e.nativeEvent)}>
                {item.icon && <Icon style={{ marginRight: 5 }} icon={item.icon} size={item.iconSize ? item.iconSize : 14}></Icon>}
                {item.renderIcon && item.renderIcon(item, this)}
                <span className='shy-menu-box-item-option-text'>{item.text}</span>
                {item.checkLabel && <Icon className={'shy-menu-box-item-option-label-icon'} size={14} icon={CheckSvg}></Icon>}
                {item.label && <label>{item.label}</label>}
                {Array.isArray(item.btns) && item.btns.map(btn => {
                    return <ToolTip key={btn.name} overlay={btn.overlay} placement={btn.placement || 'top'} ><em onMouseUp={e => { e.stopPropagation(); this.click(item, e, btn.name) }}><Icon icon={btn.icon}></Icon></em></ToolTip>
                })}
                {item.childs && item.childs.length > 0 && <Icon className={'shy-menu-box-item-option-spread'} icon='arrow-right:sy'></Icon>}
            </a></ToolTip>}
            {(item.type == MenuItemType.custom) && <ToolTip overlay={item.overlay} placement={'right'} ><a className={'shy-menu-box-item-custom' + (item.disabled == true ? " disabled" : "")}
                onMouseUp={e => this.select(item, e.nativeEvent)}>
                {item.render && item.render(item, this)}
            </a></ToolTip>}
            {item.type == MenuItemType.divide && <a className='shy-menu-box-item-divide'></a>}
            {item.type == MenuItemType.text && <a className='shy-menu-box-item-text'>{item.text}</a>}
            {item.type == MenuItemType.switch && <a className='shy-menu-box-item-switch'>
                {item.icon && <Icon style={{ marginRight: 5 }} icon={item.icon} size={item.iconSize ? item.iconSize : 14}></Icon>}
                <span>{item.text}</span>
                <Switch onChange={e => this.checked(e, item)} checked={item.checked ? item.checked : false}></Switch>
            </a>}
            {item.type == MenuItemType.input && <div className="shy-menu-box-item-input"><Input size={'small'} value={item.value} onEnter={e => { item.value = e; this.select(item) }} onChange={e => item.value = e} placeholder={item.text}></Input></div>}
            {item.type == MenuItemType.button && <div className="shy-menu-box-item-button"><Button icon={item.icon} disabled={item.disabled} block onClick={e => item.buttonClick != 'click' ? this.select(item, e.nativeEvent) : this.click(item, e)}>{item.text}</Button></div>}
            {item.type == MenuItemType.select && <div className="shy-menu-box-item-select">
                {item.icon && <Icon icon={item.icon} style={{ marginRight: 5 }} size={item.iconSize ? item.iconSize : 14}></Icon>}
                {item.renderIcon && item.renderIcon(item, this)}
                <span className='shy-menu-box-item-option-text'>{item.text}</span>
                <span className="shy-menu-box-item-select-value" onMouseDown={e => this.openSelectMenu(item, e)}>
                    <em>{item?.options?.find(g => g.value == item.value)?.text}</em>
                    <Icon icon={ChevronDownSvg}></Icon>
                </span>
            </div>}
            {item.type == MenuItemType.drag && <ToolTip overlay={item.overlay} placement={item.placement || 'right'} ><div data-drag={item.drag} onMouseUp={e => this.select(item, e.nativeEvent)} className="shy-menu-box-item-drag">
                <em className={'drag'} onMouseUp={e => e.stopPropagation()}> <Icon size={12} icon={DragHandleSvg}></Icon></em>
                {item.icon && <Icon style={{ marginRight: 5 }} icon={item.icon} size={item.iconSize ? item.iconSize : 14}></Icon>}
                {item.renderIcon && item.renderIcon(item, this)}
                <span className='shy-menu-box-item-drag-text'>{item.text}</span>
                {item.checkLabel && <Icon className={'shy-menu-box-item-drag-label-icon'} size={14} icon={CheckSvg}></Icon>}
                {item.label && <label>{item.label}</label>}
                {Array.isArray(item.btns) && item.btns.map(btn => {
                    return <ToolTip key={btn.name} overlay={btn.overlay} placement={btn.placement || 'top'} ><em className="btn" onMouseUp={e => { e.stopPropagation(); this.click(item, e, btn.name) }}><Icon size={14} icon={btn.icon}></Icon></em></ToolTip>
                })}
            </div></ToolTip>}
            {item?.childs?.length > 0 && this.hover && <MenuBox parent={this.props.parent} select={this.props.select} click={this.props.click} input={this.props.input} items={item.childs} ref={e => this.menubox = e} deep={this.props.deep}></MenuBox>}
        </div>
    }
}