import React from 'react';
import Singleton from './Singleton';
export declare type ContextMenuItemType = {
    type?: 'devide' | 'text' | 'check' | 'input';
    icon?: string;
    text?: string;
    tip?: string;
    name?: string;
    disabled?: boolean;
    label?: string;
    childs?: ContextMenuItemType[];
    mousedown?: (event: MouseEvent) => void;
};
export declare var contextmenu: Singleton<Readonly<{}> & Readonly<{
    children?: React.ReactNode;
}>, Readonly<{
    items: ContextMenuItemType[];
    top: number;
    left: number;
    itemMousedown?: (item: ContextMenuItemType, event: MouseEvent) => void;
    spread: boolean;
}>>;
