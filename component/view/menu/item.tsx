
import React from "react";
import { MenuPanel, useSelectMenuItem } from ".";
import { Rect } from "../../../src/common/vector/point";
import { CheckSvg, ChevronDownSvg, ChevronRightSvg, DragHandleSvg } from "../../svgs";
import { Button } from "../button";
import { DragList } from "../drag.list";
import { Icon } from "../icon";
import { Input } from "../input";
import { Switch } from "../switch";
import { ToolTip } from "../tooltip";
import { MenuBox } from "./box";
import { MenuItem, MenuItemType } from "./declare";
import { MenuView } from "./menu";
import { Avatar } from "../avator/face";
import { HelpText } from "../text";
import { useIconPicker } from "../../../extensions/icon";
import { IconArguments } from "../../../extensions/icon/declare";
import { util } from "../../../util/util";

export class MenuItemView extends React.Component<{
    item: MenuItem,
    deep: number,
    parent: MenuPanel<any> | MenuView,
    select: (item: MenuItem, event?: MouseEvent | KeyboardEvent) => void,
    input: (item: MenuItem) => void,
    click: (item: MenuItem, event?: React.MouseEvent, clickName?: string) => void
}> {
    el: HTMLElement;
    select(item: MenuItem, event?: MouseEvent | KeyboardEvent) {
        if (item?.disabled) return;
        if (item?.selectInput == true) {
            if (item.updateMenuPanel) this.props.parent.forceUpdate()
            else this.forceUpdate()
            this.props?.input(item);
        }
        else this.props?.select(item, event);
    }
    checked(checked: boolean, item: MenuItem) {
        if (item.disabled) return;
        item.checked = checked;
        item.value = checked;
        if (item.updateMenuPanel) this.props.parent.forceUpdate()
        else this.forceUpdate();
        this.props?.input(item);
    }
    input(e: string, item: MenuItem) {
        if (item.disabled) return;
        item.value = e;
        if (item.updateMenuPanel) this.props.parent.forceUpdate()
        this.props?.input(item);
    }
    click(item: MenuItem, event?: React.MouseEvent, name?: string) {
        if (item.disabled) return;
        this.props?.click(item, event, name);
    }
    hover: boolean = false;
    mouseenter(item: MenuItem, event: MouseEvent, cb?: () => void) {
        if (this.props.parent.free) return;
        this.hover = true;
        this.forceUpdate(() => {
            if (this.el && this.props.item?.childs?.length > 0 && this.menubox) {
                var isFixed = this.props.deep == 0 && this.props.parent instanceof MenuView;
                var rect = Rect.from(this.el.getBoundingClientRect());
                if (this.props.parent instanceof MenuView) {
                    if (typeof this.props.parent.props.cacRelative == 'function') {
                        rect = this.props.parent.props.cacRelative(rect);
                    }
                }
                var pos = this.props.item.childsPos || {};
                this.menubox.open(Object.assign(pos, {
                    roundArea: rect,
                    direction: 'right',
                    relativePoint: isFixed ? undefined : rect.leftTop,
                    dist: -10
                }),
                    {
                        position: isFixed ? 'fixed' : "absolute"
                    });
            }
            if (cb) cb();
        });
    }
    mouseleave(item: MenuItem, event: MouseEvent) {
        if (this.props.parent.free) return;
        this.hover = false;
        this.forceUpdate();
    }
    async openSelectMenu(item: MenuItem, event: React.MouseEvent) {
        var el = event.currentTarget as HTMLElement;
        var options = item.options;
        if (typeof item.cacOptions == 'function') {
            var items = this.props.parent instanceof MenuView ? (this.props.parent.props.items) : (this.props.parent.menus);
            options = await item.cacOptions(items, item);
            item.options = options;
        }
        var r = await useSelectMenuItem({ dist: 3, roundArea: Rect.fromEle(el), align: 'end' },
            options.map(op => {
                return {
                    ...op,
                    checkLabel: item.value == op.value
                }
            }),
            {
                height: 300,
                nickName: 'selectBox',
                width: item.selectDropWidth || undefined
            }
        );
        if (r) {
            item.value = r.item.value;
            if (item.updateMenuPanel) this.props.parent.forceUpdate()
            else this.forceUpdate();
            if (item.buttonClick == 'select') this.props.select(item)
            else this.props?.input(item);
        }
    }
    async changeIcon(item: MenuItem, event: React.MouseEvent) {
        if (item.disabled) return;
        var r = await useIconPicker({
            roundArea: Rect.fromEle(event.currentTarget as HTMLElement)
        }, item.icon as IconArguments);
        if (typeof r != 'undefined') {
            item.icon = r;
            if (item.updateMenuPanel) this.props.parent.forceUpdate()
            else this.forceUpdate();
            this.props?.input(item);
        }
    }
    dragChange(to: number, from: number) {
        var childs = this.props.item.childs;
        var c = childs[from];
        childs.splice(from, 1);
        childs.splice(to, 0, c);

        this.props.item.value = [from, to];
        this.props?.input(this.props.item);
        this.props.item.value = undefined;
        if (this.props.item.updateMenuPanel) this.props.parent.forceUpdate()
    }
    menubox: MenuBox;
    render() {
        var item = this.props.item;
        if (typeof item.visible != 'undefined') {
            var items = this.props.parent instanceof MenuView ? (this.props.parent.props.items) : (this.props.parent.menus);
            if (typeof item.visible == 'function' && item.visible(items, item) === false) return <></>
            else if (item.visible === false) return <></>
        }
        if (item.type == MenuItemType.container) return <DragList
            onChange={(e, c) => this.dragChange(e, c)}
            isDragBar={e => e.closest('.drag') ? true : false}
            style={{ maxHeight: item.containerHeight || undefined, overflowY: item.containerHeight ? 'auto' : undefined }}
            className="shy-menu-box-item-container">
            {item.childs.map((item, i) => {
                return <MenuItemView
                    parent={this.props.parent}
                    key={i}
                    select={this.props.select}
                    click={this.props.click}
                    input={this.props.input}
                    item={item}
                    deep={this.props.deep}></MenuItemView>
            })}
        </DragList>
        return <div
            onMouseLeave={e => this.mouseleave(item, e.nativeEvent)}
            onMouseEnter={e => this.mouseenter(item, e.nativeEvent)}
            className={'shy-menu-box-item' + (this.hover ? " hover" : "")}
            ref={e => {
                if (e) {
                    this.el = e;
                    this.el['data-menu-item'] = this;
                }
            }}>
            {(item.type == MenuItemType.item || !item.type) && <ToolTip overlay={item.overlay} placement={item.placement || 'right'} ><div className={'shy-menu-box-item-option' + (item.disabled == true ? " disabled" : "") + (item.warn && item.disabled !== true ? " warn" : "")}
                onMouseDown={e => this.select(item, e.nativeEvent)}>
                {item.icon && <i className={"flex-center flex-line  text-1 " + (util.covertToArray(item.iconClassName).join(' ')) + (item.iconSize > 20 ? "" : " size-20")}><Icon icon={item.icon} size={item.iconSize ? item.iconSize : 16}></Icon></i>}
                {item.renderIcon && item.renderIcon(item, this)}
                <span className='shy-menu-box-item-option-text text-overflow flex'>
                    {item.text}{item.remark && <i className="remark padding-l-5">{item.remark}</i>}
                    {item.helpUrl && <span className="flex-fixed h-20 flex"><HelpText onMouseDown={e => e.stopPropagation()} url={item.helpUrl}>{item.helpText}</HelpText></span>}
                </span>
                {item.checkLabel && <Icon className={'shy-menu-box-item-option-label-icon gap-r-8'} size={16} icon={CheckSvg}></Icon>}
                {item.label && !item.checkLabel && <label>{item.label}</label>}
                {Array.isArray(item.btns) && item.btns.map(btn => {
                    return <ToolTip key={btn.name} overlay={btn.overlay} placement={btn.placement || 'top'} ><em className="flex-center flex-line size-20" onMouseDown={e => { e.stopPropagation(); this.click(item, e, btn.name) }}><Icon size={16} icon={btn.icon}></Icon></em></ToolTip>
                })}
                {(item.childs && item.childs.length > 0 || item.forceHasChilds) && <Icon size={18} className={'shy-menu-box-item-option-spread remark'} icon={ChevronRightSvg}></Icon>}
            </div></ToolTip>}
            {(item.type == MenuItemType.custom) && <ToolTip overlay={item.overlay} placement={'right'} ><div className={'shy-menu-box-item-custom' + (item.disabled == true ? " disabled" : "")}
                onMouseDown={e => { if (typeof item.value != 'undefined') this.select(item, e.nativeEvent) }}>
                {item.render && item.render(item, this)}
            </div></ToolTip>}
            {item.type == MenuItemType.divide && <div className='shy-menu-box-item-divide'></div>}
            {item.type == MenuItemType.gap && <div className="h-10"></div>}
            {item.type == MenuItemType.text && <div className='shy-menu-box-item-text flex'>
                <span className="flex-auto flex">
                    <span>{item.text}</span>
                    {item.helpUrl && item.helpAlign != 'right' && <span className="flex-fixed h-20 flex"><HelpText onMouseDown={e => e.stopPropagation()} url={item.helpUrl}>{item.helpText}</HelpText></span>}
                </span>
                {item.label && <label className="flex-fixed">{item.label}</label>}
                {item.helpUrl && item.helpAlign == 'right' && <span className="flex-fixed h-20 flex"><HelpText onMouseDown={e => e.stopPropagation()} url={item.helpUrl}>{item.helpText}</HelpText></span>}
            </div>}
            {item.type == MenuItemType.user && <div onMouseDown={e => this.select(item, e.nativeEvent)} className="shy-menu-box-item-user"><Avatar userid={item.userid} middle showName size={item.size || 30}></Avatar></div>}
            {item.type == MenuItemType.switch && <div className='shy-menu-box-item-switch'>
                {item.icon && <i className="flex-center flex-inline size-20 text-1"><Icon icon={item.icon} className={(util.covertToArray(item.iconClassName).join(' '))} size={item.iconSize ? item.iconSize : 16}></Icon></i>}
                {item.renderIcon && item.renderIcon(item, this)}
                <span className="shy-menu-box-item-switch-text  flex">
                    {item.text}
                    {item.remark && <i className="remark padding-l-5">{item.remark}</i>}
                    {item.helpUrl && <span className="flex-fixed h-20 flex"><HelpText onMouseDown={e => e.stopPropagation()} url={item.helpUrl}>{item.helpText}</HelpText></span>}
                </span>
                <Switch size='small' onChange={e => this.checked(e, item)} checked={(typeof item.checked == 'boolean' ? item.checked : item.value) ? true : false}></Switch>
            </div>}
            {item.type == MenuItemType.help && <div className="shy-menu-box-item-help">
                <HelpText className={'padding-w-5'} align="left" block={item.helpInline === false ? true : false} url={item.url}>{item.text}</HelpText>
            </div>}
            {item.type == MenuItemType.input && !item.label && <div className="shy-menu-box-item-input"><Input focusSelectionAll size={'small'} value={item.value} onEnter={(e, ee) => { item.value = e; this.select(null, ee.nativeEvent) }} onChange={e => { item.value = e; this.input(e, item) }} placeholder={item.placeholder || item.text}></Input></div>}
            {item.type == MenuItemType.input && item.label && <div className="flex shy-menu-box-item-input">
                <span className="flex-fixed">{item.label}</span>
                <span className="flex-auto gap-l-20"><Input focusSelectionAll size={'small'} value={item.value} onEnter={(e, ee) => { item.value = e; this.select(null, ee.nativeEvent) }} onChange={e => { item.value = e; this.input(e, item) }} placeholder={item.placeholder || item.text}></Input></span>
            </div>}
            {item.type == MenuItemType.inputTitleAndIcon && <div className="shy-menu-box-item-input-icon flex">
                <div onMouseDown={e => this.changeIcon(item, e)} className="cursor flex-fixed size-20 flex-center gap-r-10 round item-hover border">
                    <Icon icon={item.icon} className={(util.covertToArray(item.iconClassName).join(' '))} size={item.iconSize || 16}></Icon>
                </div>
                <div className="flex-auto"><Input focusSelectionAll size={'small'}
                    value={item.value}
                    onEnter={(value, e) => {
                        item.value = value;
                        console.log('ggg', value);
                        this.select(null, e.nativeEvent)
                    }}
                    onChange={e => {
                        item.value = e;
                        this.input(e, item)
                    }}
                    placeholder={item.placeholder || item.text}></Input></div>
            </div>}
            {item.type == MenuItemType.button && <div className="shy-menu-box-item-button"><Button icon={item.icon} disabled={item.disabled} block onClick={e => item.buttonClick != 'click' ? this.select(item, e.nativeEvent) : this.click(item, e)}>{item.text}</Button></div>}
            {item.type == MenuItemType.select && <div onMouseDown={e => this.openSelectMenu(item, e)} className="shy-menu-box-item-select">
                {item.icon && <i className="flex-center flex-inline size-20 flex-fixed text-1"><Icon className={(util.covertToArray(item.iconClassName).join(' '))} icon={item.icon} size={item.iconSize ? item.iconSize : 16}></Icon></i>}
                {item.renderIcon && item.renderIcon(item, this)}
                <span className='shy-menu-box-item-option-text flex-auto'>{item.text}
                    {item.remark && <i className="remark padding-l-5">{item.remark}</i>}
                    {item.helpUrl && <span className="flex-fixed h-20 flex"><HelpText onMouseDown={e => e.stopPropagation()} url={item.helpUrl}>{item.helpText}</HelpText></span>}
                </span>
                <span className="shy-menu-box-item-select-value flex  flex-fixed" >
                    {item?.options?.find(g => g.value == item.value)?.icon && <span className="flex-center flex-inline size-20 flex-fixed text-1"><Icon size={item.optionIconSize ? item.optionIconSize : 16} className={util.covertToArray(item.optionIconClassName).join(' ')} icon={item?.options?.find(g => g.value == item.value)?.icon}></Icon></span>}
                    <em className="text-over flex-auto max-w-100">{item?.options?.find(g => g.value == item.value)?.text}</em>
                    <Icon className={'flex-fixed'} size={16} icon={ChevronDownSvg}></Icon>
                </span>
            </div>}
            {item.type == MenuItemType.buttonOptions && <div className="flex flex-wrap padding-l-5">
                {item.options.map((op, index) => {
                    return <ToolTip key={index} overlay={op.overlay}><div onMouseDown={e => {
                        item.value = op.value;
                        this.select(item, e.nativeEvent)
                    }} style={{ flexGrow: 1 }} className="item-hover padding-h-5 round gap-r-5 cursor">
                        {op.icon && <div className="flex-center" style={{ color: item.value == op.value ? "var(--text-b-color)" : "var(--text-color)" }}><Icon size={item.iconSize || 18} icon={op.icon}></Icon></div>}
                        <div className="remark flex-center f-12" style={{ fontWeight: item.value == op.value ? "bold" : undefined, color: item.value == op.value ? "var(--text-b-color)" : "var(--text-color)" }}>{op.text}</div>
                    </div></ToolTip>
                })}
            </div>}
            {item.type == MenuItemType.drag && <ToolTip overlay={item.overlay} placement={item.placement || 'right'} ><div data-drag={item.drag}
                onMouseDown={e => this.select(item, e.nativeEvent)} className="shy-menu-box-item-drag">
                <em className={'drag'} onMouseDown={e => { e.stopPropagation() }}><Icon size={12} icon={DragHandleSvg}></Icon></em>
                {item.icon && <Icon style={{ marginRight: 5 }} icon={item.icon} className={(util.covertToArray(item.iconClassName).join(' '))} size={item.iconSize ? item.iconSize : 16}></Icon>}
                {item.renderIcon && item.renderIcon(item, this)}
                {item.renderContent && <div className="flex-auto">{item.renderContent(item, this)}</div>}
                {item.text && <span className='shy-menu-box-item-drag-text text-overflow'>{item.text}</span>}
                {item.checkLabel && <Icon className={'shy-menu-box-item-drag-label-icon'} size={14} icon={CheckSvg}></Icon>}
                {item.label && <label>{item.label}</label>}
                {Array.isArray(item.btns) && item.btns.map(btn => {
                    return <ToolTip key={btn.name} overlay={btn.overlay} placement={btn.placement || 'top'} ><em className="btn" onMouseDown={e => { e.stopPropagation(); this.click(item, e, btn.name) }}><Icon size={14} icon={btn.icon}></Icon></em></ToolTip>
                })}
            </div></ToolTip>}
            {item.type == MenuItemType.color && <div className={"shy-menu-box-item-colors  gap-h-10" + (item.block ? "" : " flex-top flex-wrap")}>
                {item.options.map(t => {
                    if (item.block) {
                        return <a key={t.value} className={"flex  cursor padding-w-10 padding-h-3 round item-hover " + (t.checked ? "item-hover-focus" : "")}
                            onMouseDown={e => { e.stopPropagation(); item.value = t.value; this.select(item, e.nativeEvent) }}>
                            {item.name && item.name.indexOf('font') > -1 && <span className="size-24 flex-center circle  border" style={{ color: t.value }}>
                                A
                            </span>}
                            {!(item.name && item.name.indexOf('font') > -1) && <span className="size-20 circle   border" style={{ backgroundColor: t.value }}>
                            </span>}
                            <span className="gap-l-10 f-12 text-1 inline-block ">{t.text}</span>
                        </a>
                    }
                    return <a key={t.value} className={"flex-center flex-col cursor padding-5 gap-w-3  round item-hover " + (t.checked ? "item-hover-focus" : "")}
                        onMouseDown={e => { e.stopPropagation(); item.value = t.value; this.select(item, e.nativeEvent) }}>
                        {item.name && item.name.indexOf('font') > -1 && <span className="size-20 flex-center circle  border" style={{ color: t.value }}>
                            A
                        </span>}
                        {!(item.name && item.name.indexOf('font') > -1) && <span className="size-20 circle   border" style={{ backgroundColor: t.value }}>
                        </span>}
                        <span className="f-12 text-1 inline-block ">{t.text}</span>
                    </a>
                })}
            </div>}
            {item?.childs?.length > 0 && this.hover && <MenuBox style={this.props.item.childsStyle || {}} parent={this.props.parent} select={this.props.select} click={this.props.click} input={this.props.input} items={item.childs} ref={e => this.menubox = e} deep={this.props.deep}></MenuBox>}
        </div>
    }
    componentDidMount(): void {
        if (this.props.item?.type == MenuItemType.select && typeof this.props.item.options == 'undefined' && typeof this.props.item.cacOptions == 'function') {
            var items = this.props.parent instanceof MenuView ? (this.props.parent.props.items) : (this.props.parent.menus);
            this.props.item.cacOptions(items, this.props.item).then(e => {
                this.props.item.options = e;
                this.forceUpdate();
            })
        }
    }
}