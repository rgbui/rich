
import React, { ReactNode } from "react";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { GetFieldTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { DragHandleSvg, OrderSvg, PlusSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { ToolTip } from "../../../../component/view/tooltip";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import { Tip } from "../../../../component/view/tooltip/tip";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { MouseDragger } from "../../../../src/common/dragger";
import { ghostView } from "../../../../src/common/ghost";
import { Point } from "../../../../src/common/vector/point";
import { getFieldFilterUrl } from "../../../../blocks/data-grid/schema/filter";
import { Divider } from "../../../../component/view/grid";
import { HelpText } from "../../../../component/view/text";


export class DataGridTrigger extends EventsComponent {
    get schema() {
        return this.block?.schema;
    }
    block: DataGridView;
    onOpen(block: DataGridView) {
        this.block = block;
        this.forceUpdate();
    }
    onDrag(event: React.MouseEvent, props: Record<string, any>) {
        event.stopPropagation();
        var item = (event.currentTarget as HTMLElement).parentNode as HTMLElement;
        MouseDragger<{ item: HTMLElement }>({
            event,
            dis: 5,
            isCross: true,
            moveStart(ev, data, crossData) {
                crossData.type = 'createBlock';
                crossData.data = props
                ghostView.load(item, { point: Point.from(ev) })
            },
            moving(ev, data, isend) {
                if (isend) return;
                ghostView.move(Point.from(ev));
            },
            moveEnd(ev, isMove, data) {
                ghostView.unload();
            }
        })
    }
    render(): ReactNode {
        if (!this.block) return <></>;
        if (!this.schema) return <div></div>
        return <div className="f-14 ">
            <div className="max-h-300 overflow-y">
                <div className="h-30 flex padding-w-10 gap-w-5 gap-h-10 text-1 f-14">
                    <S text="拖动视图触发器至页面">拖动视图触发器至页面管理数据表</S>
                </div>
                <div className="remark f-12 padding-w-10 gap-w-5 gap-t-10"><S text='查询按钮'>查询按钮</S></div>
                <div>
                    <div className="flex item-hover round h-30 padding-w-5 gap-w-5   ">
                        <Tip text='拖至页面插入'><span className="size-24 text-1 item-hover round flex-center cursor" onMouseDown={e => this.onDrag(e, { url: BlockUrlConstant.DataGridLatestOrHot, refBlockId: this.block.id })}><Icon size={14} icon={DragHandleSvg}></Icon></span></Tip>
                        <span className="flex-center gap-r-3 round"><Icon size={14} icon={{ name: 'bytedance-icon', code: 'fire' }}></Icon></span><span><S>最新最热</S></span>
                        <span className="flex-auto flex-end"><Tip text={'插入到页面'}><span className="size-24 flex-center item-hover round cursor  text-1  " onMouseDown={e => { this.block.onExtendTriggerBlock(BlockUrlConstant.DataGridLatestOrHot, { refBlockId: this.block.id }) }}><Icon size={18} icon={PlusSvg}></Icon></span></Tip></span>
                    </div>
                    <div className="flex item-hover round h-30 padding-w-5 gap-w-5   ">
                        <Tip text='拖至页面插入'><span className="size-24 text-1 item-hover round flex-center cursor" onMouseDown={e => this.onDrag(e, { url: BlockUrlConstant.DataGridOptionRule, refBlockId: this.block.id })}><Icon size={14} icon={DragHandleSvg}></Icon></span></Tip>
                        <span className="flex-center gap-r-3 round"><Icon size={14} icon={{ name: 'bytedance-icon', code: 'association' }}></Icon></span><span><S>自定义查询规则</S></span>
                        <span className="flex-auto flex-end"><Tip text={'插入到页面'}><span className="size-24 flex-center item-hover round cursor text-1  " onMouseDown={e => { this.block.onExtendTriggerBlock(BlockUrlConstant.DataGridOptionRule, { refBlockId: this.block.id }) }}><Icon size={18} icon={PlusSvg}></Icon></span></Tip></span>
                    </div>
                </div>
                <div className="remark f-12 padding-w-10 gap-w-5 gap-t-10"><S text='表单按钮'>表单</S></div>
                <div>
                    {this.block.schema.recordViews.map(rv => {
                        return <div key={rv.id} className="flex item-hover round h-30 padding-w-5 gap-w-5  cursor"><Tip text='拖至页面插入'><span className="size-24 text-1 item-hover round flex-center" onMouseDown={e => this.onDrag(e, {
                            url: BlockUrlConstant.Button,
                            buttonText: lst('添加') + this.block.schema.text,
                            flow: {
                                commands: [{ url: '/addRecords', schemaId: this.block.schema.id, schemaViewId: rv.id }]
                            }
                        })}><Icon size={14} icon={DragHandleSvg}></Icon></span></Tip>
                            <span className="flex-center gap-r-3 round  "><Icon size={14} icon={rv.icon || OrderSvg}></Icon></span><span>{rv.text}</span>
                            <span className="flex-auto flex-end"><Tip text={'插入到页面'}><span className="size-24 flex-center item-hover round cursor  text-1 " onMouseDown={e => {
                                this.block.onExtendTriggerBlock(BlockUrlConstant.Button, {
                                    url: BlockUrlConstant.Button,
                                    buttonText: lst('添加') + this.block.schema.text,
                                    flow: {
                                        commands: [{ url: '/addRecords', schemaId: this.block.schema.id, schemaViewId: rv.id }]
                                    }
                                })
                            }}><Icon size={18} icon={PlusSvg}></Icon></span></Tip></span>
                        </div>
                    })}
                </div>
                <div className="remark f-12 padding-w-10 gap-w-5 gap-t-10"><S text='字段查询'>字段查询</S></div>
                {this.block.schema.visibleFields.findAll(g => ![
                    // FieldType.video,
                    FieldType.formula,
                    FieldType.rollup,
                    FieldType.button,
                    FieldType.deleted,
                    // FieldType.audio,
                    FieldType.parentId,
                    FieldType.like,
                    FieldType.oppose,
                    FieldType.love,
                    FieldType.comment,
                    FieldType.emoji,
                    FieldType.sort,
                    FieldType.autoIncrement,

                ].includes(g.type)).reverse().map(f => {
                    return <div key={f.id} className="flex item-hover round h-30 padding-w-5 gap-w-5 ">
                        <Tip text='拖至页面插入'><span className="size-24 text-1 item-hover round flex-center cursor" onMouseDown={e => this.onDrag(e, { url: getFieldFilterUrl(f), refBlockId: this.block.id, refFieldId: f.id })}><Icon size={16} icon={DragHandleSvg}></Icon></span></Tip>
                        <span className="flex-fixed gap-r-3 flex-center cursor round "><Icon size={14} icon={GetFieldTypeSvg(f.type)}></Icon></span>
                        <span className="flex-auto">{f.text}</span>
                        <ToolTip overlay={lst("点击插入过滤组件块")}>
                            <span onMouseDown={e => this.block.onExtendTriggerBlock(getFieldFilterUrl(f), { refFieldId: f.id })} className="flex-fix size-24 flex-center cursor round item-hover text-1 ">
                                <Icon size={18} icon={PlusSvg}></Icon>
                            </span>
                        </ToolTip>
                    </div>
                })}
                <div className="remark f-12 padding-w-10 gap-w-5 gap-t-10"><S text='字段排序'>字段排序</S></div>
                {this.block.schema.visibleFields.findAll(g => ![
                    // FieldType.video,
                    FieldType.formula,
                    FieldType.rollup,
                    FieldType.button,
                    FieldType.deleted,
                    // FieldType.audio,
                    FieldType.parentId,
                    FieldType.image,
                    FieldType.file,
                    FieldType.video,
                    FieldType.like,
                    FieldType.oppose,
                    FieldType.love,
                    FieldType.comment,
                    FieldType.emoji,
                    FieldType.sort,
                    FieldType.autoIncrement,

                ].includes(g.type)).reverse().map(f => {
                    return <div key={f.id} className="flex item-hover round h-30 padding-w-5 gap-w-5 ">
                        <Tip text='拖至页面插入'><span className="size-24 text-1 item-hover round flex-center cursor" onMouseDown={e => this.onDrag(e, { url: BlockUrlConstant.DataGridFieldSort, refBlockId: this.block.id, refFieldId: f.id })}><Icon size={16} icon={DragHandleSvg}></Icon></span></Tip>
                        <span className="flex-fixed gap-r-3 flex-center cursor round "><Icon size={14} icon={GetFieldTypeSvg(f.type)}></Icon></span>
                        <span className="flex-auto">{f.text}</span>
                        <ToolTip overlay={lst("点击插入排序组件块")}>
                            <span onMouseDown={e => this.block.onExtendTriggerBlock(BlockUrlConstant.DataGridFieldSort, { refFieldId: f.id })} className="flex-fix size-24 flex-center cursor round item-hover text-1 ">
                                <Icon size={18} icon={PlusSvg}></Icon>
                            </span>
                        </ToolTip>
                    </div>
                })}
            </div>
            <Divider></Divider>
            <div className="h-30 padding-w-10 flex">
                <HelpText align="left" block url={window.shyConfig?.isUS ? "https://shy.red/ws/help/page/48" : "https://help.shy.live/page/1875"}><S>了解如何使用数据表视图触发器</S></HelpText>
            </div>
        </div>
    }
}