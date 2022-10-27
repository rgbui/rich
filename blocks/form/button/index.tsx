import React from "react";
import { FlagSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemType } from "../../../component/view/menu/declare";
import { ToolTip } from "../../../component/view/tooltip";
import { BoxTip } from "../../../component/view/tooltip/box";
import { IconArguments } from "../../../extensions/icon/declare";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { TextArea } from "../../../src/block/view/appear";
import { Rect } from "../../../src/common/vector/point";
import { PageLayoutType } from "../../../src/page/declare";
import { DataGridView } from "../../data-grid/view/base";
import "./style.less";

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
                    { text: '点击触发的动作', type: MenuItemType.text },
                    { name: 'search', checkLabel: this.action == 'search' ? true : false, text: '刷新加载列表' },
                    { name: 'batchDelete', checkLabel: this.action == 'batchDelete' ? true : false, text: '批量删除' },
                    {
                        name: 'batchEdit',
                        checkLabel: this.action == 'batchEdit' ? true : false,
                        text: '批量处理',
                        childs: [
                            {
                                text: '选择批量处理视图',
                                type: MenuItemType.text
                            },
                            ...schema.recordViews.map(rv => {
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
                        text: '添加',
                        childs: [
                            { text: '选择添加视图', type: MenuItemType.text },
                            ...schema.recordViews.map(rv => {
                                return {
                                    text: rv.text,
                                    name: 'add',
                                    checkLabel: this.action == 'add' && this.actionProps.viewId == rv.id ? true : false,
                                    value: { action: 'add', actionProps: { viewId: rv.id } }
                                }
                            })
                        ]
                    },
                    { name: 'export', checkLabel: this.action == 'export' ? true : false, text: '导出' },
                ]
            );
            if (r) {
                if (r.item.value) this.onUpdateProps(r.item.value)
                else this.onUpdateProps({ action: r.item.name })
            }
        }
        else if (this.page.pageLayout.type == PageLayoutType.dbForm) {
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
                    { text: '点击触发的动作', type: MenuItemType.text },
                    { name: 'reload', checkLabel: this.action == 'reload' ? true : false, text: '刷新加载页面' },
                    { name: 'back', checkLabel: this.action == 'back' ? true : false, text: '回退' },
                    { name: 'export', checkLabel: this.action == 'export' ? true : false, text: '导出' },
                    { name: 'open', checkLabel: this.action == 'open' ? true : false, text: '打开表单' },
                    { name: 'redict', checkLabel: this.action == 'redict' ? true : false, text: '跳转至页面' },
                ]
            );
            if (r) {
                if (r.item.value) this.onUpdateProps(r.item.value)
                else this.onUpdateProps({ action: r.item.name })
            }
        }
    }
}
@view('/button')
export class BlockButtonView extends BlockView<BlockButton>{
    render() {
        return <BoxTip overlay={<div className="flex">
            <ToolTip overlay={'动作'}>
                <a className="item-hover size-24 round cursor" onMouseDown={e => this.block.openFlash(e)}>
                    <Icon icon={FlagSvg}></Icon>
                </a>
            </ToolTip>
        </div>}>
            <button className='sy-button'
                onMouseDown={e => this.block.mousedown(e)}>
                {this.block.showIcon && <span>
                    <Icon size={16} icon={this.block.src}></Icon>
                </span>}
                {this.block.showText && <span><TextArea block={this.block} placeholder='按钮'
                    prop='content'></TextArea></span>}
            </button>
        </BoxTip>
    }
}


