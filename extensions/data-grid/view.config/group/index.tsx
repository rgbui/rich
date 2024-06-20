import lodash from "lodash";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import React from "react";
import { SelectBox } from "../../../../component/view/select/box";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { GetFieldTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import { InputNumber } from "../../../../component/view/input/number";
import { Input } from "../../../../component/view/input";
import { PlusSvg, TrashSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { TableSchema } from "../../../../blocks/data-grid/schema/meta";
import { Divider } from "../../../../component/view/grid";
import { HelpText } from "../../../../component/view/text";
import { BlockRenderRange } from "../../../../src/block/enum";

export class TableGroupView extends EventsComponent {
    get schema() {
        return this.block?.schema;
    }
    block: DataGridView;
    oldGroup: DataGridView['groupView']
    onOpen(block: DataGridView) {
        this.block = block;
        this.oldGroup = lodash.cloneDeep(this.block.groupView);
        if (!this.oldGroup) {
            this.oldGroup = {
                abled: false,
                groupId: '',
                by: 'day',
                number: {
                    by: 'interval',
                    min: 0,
                    max: 1000,
                    step: 100,
                    customs: [
                        {
                            min: 0,
                            max: 100,
                            text: '分组'
                        }
                    ]
                },
                hideGroups: [],
                sort: 'asc',
                hideEmptyGroup: false,
                statFieldId: '',
                stat: ''
            }
        }
        this.forceUpdate();
    }
    onStore = lodash.debounce(async () => {
        await this.onForceStore();
    }, 800);
    onForceStore = async () => {

        await this.block.onReloadData(async () => {
            await this.block.onManualUpdateProps({ groupView: this.block.groupView }, { groupView: this.oldGroup }, {range:BlockRenderRange.none});
        });
    }
    render() {

        if (!this.block) return <></>
        var sf = this.block.schema.fields.find(g => g.id == this.oldGroup?.groupId);
        var isDate = TableSchema.fieldIsDate(sf);
        var isNumber = TableSchema.fieldIsNumber(sf);
        return <div className="gap-h-10">

            <div className="padding-w-10 gap-5 round flex min-h-28 item-hover">
                <span className="flex-auto"><S>分组</S></span>
                <span className="flex-fixed"><SelectBox

                    value={this.oldGroup?.groupId}
                    onChange={e => {
                        this.oldGroup.groupId = e;
                        if (e == '') {
                            this.oldGroup.abled = false;
                        }
                        else this.oldGroup.abled = true;
                        var gf = this.block.schema.fields.find(g => g.id == e);
                        if (TableSchema.fieldIsNumber(gf)) {
                            if (!this.oldGroup.number)
                                this.oldGroup.number = {
                                    by: 'interval',
                                    min: 0,
                                    max: 1000,
                                    step: 100,
                                    customs: []
                                }
                        }
                        if (TableSchema.fieldIsDate(gf)) {
                            if (!this.oldGroup.by)
                                this.oldGroup.by = 'day'
                        }
                        this.forceUpdate()
                        this.onStore();
                    }}
                    options={[{
                        text: lst('无'),
                        icon: { name: 'byte', code: 'rectangle-one' },
                        value: ''
                    },
                    ...this.block.schema.visibleFields.findAll(g => ![FieldType.comment,
                    FieldType.love,
                    FieldType.audio,
                    FieldType.image,
                    FieldType.video,
                    FieldType.file,
                    FieldType.browse,
                    FieldType.like,
                    FieldType.id,
                    FieldType.approve].includes(g.type)).map(g => {
                        return {
                            text: g.text,
                            icon: GetFieldTypeSvg(g),
                            value: g.id
                        }
                    })]}
                ></SelectBox></span>

            </div>

            {isDate && <div className="padding-w-10 gap-5 round flex min-h-28 item-hover">
                <span className="flex-auto"><S>日期</S></span>
                <div className="flex-fixed">
                    <SelectBox
                        value={this.oldGroup?.by}
                        onChange={e => {
                            this.oldGroup.by = e;
                            this.forceUpdate();
                            this.onStore();
                        }}
                        options={[
                            { text: lst('日'), value: 'day' },
                            { text: lst('月'), value: 'month' },
                            { text: lst('年'), value: 'year' },
                            { text: lst('周'), value: 'week' },
                        ]
                        }
                    ></SelectBox>
                </div>
            </div>}

            {isNumber && <div className="padding-w-10 gap-5 round flex min-h-28 item-hover">
                <span className="flex-auto"><S>数字</S></span>
                <div className="flex-fixed">
                    <SelectBox
                        value={this.oldGroup?.number?.by}
                        options={[
                            { text: lst('间隔'), value: 'interval' },
                            { text: lst('自定义'), value: 'custom' },
                        ]}
                        onChange={e => {
                            if (!this.oldGroup.number) this.oldGroup.number = {} as any
                            this.oldGroup.number.by = e;
                            this.forceUpdate();
                            this.onStore();
                        }}
                    ></SelectBox>
                </div>
            </div>}

            {sf && isNumber && this.oldGroup?.number?.by == 'interval' && <div className="gap-5 border-light padding-10 round bg-1">
                <div className="flex gap-h-5">
                    <span className="flex-fixed w-120"><S>范围</S></span>
                    <div className="flex-fixed w-80"><InputNumber value={this.oldGroup.number.min} onChange={e => {
                        this.oldGroup.number.min = e;
                        this.onStore();
                    }}></InputNumber></div>
                    <span className="flex-fixed w-40 flex-center">-</span>
                    <div className="flex-fixed w-80"><InputNumber onChange={e => {
                        this.oldGroup.number.max = e;
                        this.onStore();
                    }} value={this.oldGroup.number.max}></InputNumber></div>

                </div>
                <div className="flex gap-h-5">
                    <span className="flex-fixed w-120"><S>间隔</S></span>
                    <div className="flex-fixed w-200"><InputNumber value={this.oldGroup.number.step} onChange={e => {
                        this.oldGroup.number.step = e;
                        this.onStore();
                    }}></InputNumber>
                    </div>
                    <div className="flex-auto"></div>
                </div>
                <div className="flex gap-h-5 remark f-12">
                    {this.oldGroup.number.min}-{this.oldGroup.number.min + this.oldGroup.number.step}，{this.oldGroup.number.min + this.oldGroup.number.step}-{this.oldGroup.number.min + this.oldGroup.number.step * 2}，...
                </div>

            </div>}
            {sf && isNumber && this.oldGroup?.number?.by == 'custom' && <div className="gap-5  border-light  padding-10 round bg-1">
                {this.oldGroup.number.customs.map((g, i) => {
                    return <div className="flex gap-h-5" key={i}>
                        <div className="flex-fixed w-60">
                            <InputNumber value={g.min} onChange={e => {
                                g.min = e;
                                this.onStore();
                            }}></InputNumber>
                        </div>

                        <span className="flex-fixed gap-w-10">≤</span>
                        <div className="flex-fixed w-100">
                            <Input value={g.text} onChange={e => {
                                g.text = e;
                                this.onStore();
                            }}></Input>
                        </div>
                        <span className="flex-fixed  gap-w-10">&lt;</span>
                        <div className="flex-fixed w-60"><InputNumber value={g.max} onChange={e => {
                            g.max = e;
                            this.onStore();
                        }}></InputNumber></div>
                        <div className="flex-auto"></div>
                        <span style={{
                            visibility: this.oldGroup.number.customs.length > 1 ? 'visible' : 'hidden'
                        }} className="size-20 flex-center gap-l-10 round item-hover cursor" onMouseDown={e => {
                            if (this.oldGroup.number.customs.length == 1) return;
                            this.oldGroup.number.customs.splice(i, 1);
                            this.forceUpdate();
                            this.onStore();
                        }}>
                            <Icon size={16} icon={TrashSvg} ></Icon>
                        </span>
                    </div>
                })}

                <div className="h-28 gap-t-5 ">
                    <span className="item-hover remark  flex flex-inline cursor round padding-w-10 padding-h-2" onMouseDown={e => {
                        var lc = this.oldGroup.number.customs.last();
                        this.oldGroup.number.customs.push({
                            min: (lc?.max || -1) + 1,
                            text: lst('分组') + this.oldGroup.number.customs.length,
                            max: (lc?.max || -1) + 100
                        })
                        this.forceUpdate();
                        this.onStore();
                    }}>
                        <Icon icon={PlusSvg} size={18}></Icon>
                        <span className="gap-l-3"><S>添加自定义项</S></span>
                    </span>
                </div>

            </div>}


            <div className="padding-w-10 gap-5 round flex min-h-28 item-hover">
                <span className="flex-auto"><S>排序</S></span>
                <div className="flex-fixed">
                    <SelectBox
                        value={this.oldGroup.sort || 'auto'}
                        onChange={e => {
                            this.oldGroup.sort = e;
                            this.forceUpdate();
                            this.onStore();
                        }}
                        options={[
                            { text: lst('默认'), value: 'auto' },
                            { text: lst('升序'), value: 'asc' },
                            { text: lst('降序'), value: 'desc' }
                        ]}
                    ></SelectBox>
                </div>
            </div>

            {/* <div className="padding-w-10 gap-5 round flex  min-h-28 item-hover">
                <span className="flex-auto">{lst('隐藏空内容分组')}</span>
                <span className="flex-fixed"><Switch checked={this.oldGroup.hideEmptyGroup} onChange={e => {
                    this.oldGroup.hideEmptyGroup = e;
                    this.forceUpdate();
                    this.onStore();
                }}></Switch></span>
            </div> */}

            <Divider></Divider>
            {sf && <div onMouseDown={e => {
                this.oldGroup.abled = false;
                this.oldGroup.groupId = '';
                this.forceUpdate();
                this.onStore();
            }} className="padding-w-10 gap-5 remark cursor round flex  min-h-28 item-hover-warn">
                <span className="size-16 gap-r-3 flex-center">
                    <Icon size={16} icon={TrashSvg}></Icon>
                </span>
                <span>移除分组</span>
            </div>
            }
            <div className="gap-l-15 gap-r-10">
                <HelpText url='s'><S>了解数据表分组</S></HelpText>
            </div>

        </div>
    }
}