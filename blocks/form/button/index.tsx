import React from "react";
import { DragHandleSvg, EditSvg, EmojiSvg, FlashSvg, FontSvg, PlusSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { ToolTip } from "../../../component/view/tooltip";
import { BoxTip } from "../../../component/view/tooltip/box";
import { useIconPicker } from "../../../extensions/icon";
import { IconArguments } from "../../../extensions/icon/declare";
import { Block } from "../../../src/block";
import { BlockUrlConstant } from "../../../src/block/constant";
import { BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Rect } from "../../../src/common/vector/point";
import { PageLayoutType } from "../../../src/page/declare";
import { DataGridView } from "../../data-grid/view/base";
import "./style.less";
import { DragBlockLine } from "../../../src/kit/handle/line";
import { SolidArea } from "../../../src/block/view/appear";
import { lst } from "../../../i18n/store";
import { Tip } from "../../../component/view/tooltip/tip";

@url('/button')
export class BlockButton extends Block {
    @prop()
    src: IconArguments = { name: 'emoji', code: '😀' };
    display = BlockDisplay.inline;
    @prop()
    showIcon: boolean = false;
    @prop()
    showText: boolean = true;
    @prop()
    action: string = 'none';
    @prop()
    actionProps: Record<string, any> = {};
    @prop()
    ghost: boolean = false;
    @prop()
    buttonSize: 'default' | 'larger' | 'small' = 'default';
    get refBlock(): DataGridView {
        return super.refBlock as DataGridView;
    }
    async mousedown(event: React.MouseEvent) {
        if (this.refBlock) {
            switch (this.action) {
                case 'search':
                    this.refBlock.onSearch()
                    break;
                case 'batchDelete':
                    this.refBlock.onBatchDelete();
                    break;
                case 'batchEdit':
                    this.refBlock.onBatchEdit(this.actionProps.viewId);
                    break;
                case 'add':
                    this.refBlock.onOpenAddForm(this.actionProps.viewId);
                    break;
                case 'export':
                    this.refBlock.onExport()
                    break;
            }
        }
        else {
            switch (this.action) {
                case 'reload':
                    break;
                case 'back':
                    break;
                case 'export':
                    break;
                case 'redict':
                    break;
                case 'open':
                    break;
            }
        }
    }
    async openFlash(event: React.MouseEvent) {
        if (this.refBlock) {
            var schema = this.refBlock.schema;
            var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) },
                [
                    { text: lst('点击触发动作'), type: MenuItemType.text },
                    { name: 'search', checkLabel: this.action == 'search' ? true : false, text: lst('刷新加载列表') },
                    { name: 'batchDelete', checkLabel: this.action == 'batchDelete' ? true : false, text: lst('批量删除') },
                    {
                        name: 'batchEdit',
                        checkLabel: this.action == 'batchEdit' ? true : false,
                        text: lst('批量处理'),
                        childs: [
                            {
                                text:lst( '选择批量处理视图'),
                                type: MenuItemType.text
                            },
                            ...schema.views.findAll(c => c.url == BlockUrlConstant.FormView).map(rv => {
                                return {
                                    text: rv.text,
                                    name: 'batchEdit',
                                    checkLabel: this.action == 'batchEdit' && this.actionProps.viewId == rv.id ? true : false,
                                    value: { action: 'batchEdit', actionProps: { viewId: rv.id } }
                                }
                            })
                        ]
                    },
                    {
                        name: 'add',
                        checkLabel: this.action == 'add' ? true : false,
                        text:lst( '添加'),
                        childs: [
                            { text:lst( '选择添加视图'), type: MenuItemType.text },
                            ...schema.views.map(rv => {
                                return {
                                    text: rv.text,
                                    name: 'add',
                                    checkLabel: this.action == 'add' && this.actionProps.viewId == rv.id ? true : false,
                                    value: { action: 'add', actionProps: { viewId: rv.id } }
                                }
                            })
                        ]
                    },
                    { name: 'export', checkLabel: this.action == 'export' ? true : false, text:lst( '导出') },
                ]
            );
            if (r) {
                if (r.item.value) this.onUpdateProps(r.item.value)
                else this.onUpdateProps({ action: r.item.name })
            }
        }
        else if (this.page.pageLayout.type == PageLayoutType.formView) {
            /**
             * 表单的按钮
             * 
             * 保存、取消
             * 保存并录取下一条
             */
        }
        else {
            var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) },
                [
                    { text: lst('点击触发动作'), type: MenuItemType.text },
                    { name: 'reload', checkLabel: this.action == 'reload' ? true : false, text:lst( '刷新加载页面') },
                    { name: 'back', checkLabel: this.action == 'back' ? true : false, text: lst('回退') },
                    { name: 'export', checkLabel: this.action == 'export' ? true : false, text: lst('导出') },
                    { name: 'open', checkLabel: this.action == 'open' ? true : false, text: lst('打开表单') },
                    { name: 'redict', checkLabel: this.action == 'redict' ? true : false, text:lst( '跳转至页面') },
                ]
            );
            if (r) {
                if (r.item.value) this.onUpdateProps(r.item.value)
                else this.onUpdateProps({ action: r.item.name })
            }
        }
    }
    async openEdit(event: React.MouseEvent) {
        var items: MenuItem[] = [
            {
                text: lst('显示按钮文字'),
                icon: FontSvg,
                type: MenuItemType.switch,
                checked: this.showText,
                name: 'showText',
                updateMenuPanel: true,
            },
            {
                type: MenuItemType.divide,
                visible: (items) => {
                    var mp = items.find(g => g.name == 'showText');
                    if (mp?.checked) return true
                    else return false
                },
            },
            {
                text: lst('文本'),
                visible: (items) => {
                    var mp = items.find(g => g.name == 'showText');
                    if (mp?.checked) return true
                    else return false
                },
                type: MenuItemType.input,
                name: 'content',
                value: this.content
            },
            { type: MenuItemType.divide },
            {
                text: lst('显示按钮图标'),
                icon: EmojiSvg,
                type: MenuItemType.switch,
                checked: this.showIcon,
                name: 'showIcon',
                updateMenuPanel: true,
            },
            {
                text: lst('选择按钮图标'),
                icon: PlusSvg,
                iconSize: 18,
                visible: (items) => {
                    var mp = items.find(g => g.name == 'showIcon');
                    if (mp?.checked) return true
                    else return false
                },
                name: 'src',
                value: this.content
            },
            { type: MenuItemType.divide },
            {
                text: lst('大小'),
                name: 'buttonSize',
                value: this.buttonSize,
                type: MenuItemType.select,
                options: [
                    { text: lst('默认'), value: 'default' },
                    { text:lst( '较小'), value: 'small' },
                    { text: lst('较大'), value: 'larger' }
                ]
            },
            {
                text:lst( '幽灵'),
                type: MenuItemType.switch,
                checked: this.ghost,
                name: 'ghost',
            },
        ];
        var ci = items.find(g => g.name == 'content');
        var rect = Rect.fromEvent(event);
        var self = this;
        var r = await useSelectMenuItem({ roundArea: rect }, items, {
            input(item) {
                if (item.name == 'showText' || item.name == 'showIcon' || item.name == 'ghost') {
                    self.onUpdateProps({ [item.name]: item.checked }, { range: BlockRenderRange.self });
                }
                else if (item.name == 'buttonSize') {
                    self.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self });
                }
            }
        });
        if (r?.item) {
            if (r.item.name == 'src') {
                var g = await useIconPicker({ roundArea: rect }, this.src);
                if (g) {
                    self.onUpdateProps({ src: g }, { range: BlockRenderRange.self })
                }
            }
        }
        if (ci.value !== this.content) {
            self.onUpdateProps({ content: ci.value }, { range: BlockRenderRange.self });
        }
    }
    @prop()
    content: string = lst('按钮');
    async getMd() {
        return '<button>' + this.content + '</button>'
    }
}
@view('/button')
export class BlockButtonView extends BlockView<BlockButton>{
    boxTip: BoxTip;
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this.block, event);
    }
    renderView()  {
        return <span>
            <BoxTip
                ref={e => this.boxTip = e}
                overlay={<div className="flex h-30 round padding-w-5">
                    <Tip text={'拖动'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></a></Tip>
                    <Tip text={'动作'}><span className="flex-center text-1  item-hover size-24 round cursor" onMouseDown={e => this.block.openFlash(e)}><Icon size={16} icon={FlashSvg}></Icon></span>
                    </Tip>
                    <Tip text={'编辑'}><span className="flex-center text-1  item-hover size-24 round cursor" onMouseDown={e => this.block.openEdit(e)}><Icon size={16} icon={EditSvg}></Icon></span>
                    </Tip>
                </div>}>
                <SolidArea gap block={this.block} prop={'content'}><button className={'sy-button flex' + (' sy-button-' + this.block.buttonSize) + (this.block.ghost ? " sy-button-ghost" : "")}
                    onMouseDown={e => this.block.mousedown(e)}>
                    {this.block.showIcon && <span className={this.block.showText ? "gap-r-5" : ""}><Icon size={16} icon={this.block.src}></Icon></span>}
                    {this.block.showText && <span>{this.block.content}</span>}
                </button>
                </SolidArea>
            </BoxTip>
        </span>
    }
}


