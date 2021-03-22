import React, { Component } from 'react';
import { Icon } from './icon';
import Singleton from './Singleton';
export type ContextMenuItemType = {
    type?: 'devide' | 'text' | 'check' | 'input'
    icon?: string,
    text?: string,
    tip?: string,
    name?: string,
    disabled?: boolean,
    label?: string,
    childs?: ContextMenuItemType[],
    mousedown?: (event: MouseEvent) => void,
}
function ContextmenuItem(props: { item: ContextMenuItemType, itemMousedown?: (item: ContextMenuItemType, event: MouseEvent) => void }) {
    function mousedown(e: MouseEvent) {
        if (typeof props.item.mousedown == 'function') props.item.mousedown(e);
        if (typeof props.itemMousedown == 'function') props.itemMousedown(props.item, e);
    }
    return <li>
        <a onMouseDown={e => mousedown(e.nativeEvent)}>
            <i>{props.item.icon && <Icon icon={props.item.icon}></Icon>}</i>
            <span>{props.item.text}</span>
            <label>{props.item.label}</label>
        </a>
        {props.item.childs && props.item.childs.length > 0 &&
            <ol >
                {props.item.childs.map((c, i) => <ContextmenuItem key={i} item={c}></ContextmenuItem>)}
            </ol>
        }
    </li >
}
class Contextmenu extends Component<{

}, {
    items: ContextMenuItemType[],
    top: number,
    left: number,
    itemMousedown?: (item: ContextMenuItemType,
        event: MouseEvent) => void, spread: boolean
}> {
    private constructor(props: {
        items: ContextMenuItemType[],
        itemMousedown?: (item: ContextMenuItemType,
            event: MouseEvent) => void
    }) {
        super(props);
        this.state = { spread: false, items: [], top: 0, left: 0, itemMousedown: null };
    }
    render() {
        if (this.state.spread == false) return;
        function focus() {

        }
        function blur() {

        }
        return <div className='sy-block-contextmenu' tabIndex={1} onFocus={focus} onBlur={blur}>
            <ol>
                {this.state.items.map((item, i) => {
                    return <ContextmenuItem item={item} key={i} itemMousedown={this.state.itemMousedown}></ContextmenuItem>
                })}</ol>
        </div>
    }
}
export var contextmenu = new Singleton<Contextmenu['props'], Contextmenu['state']>(Contextmenu);
