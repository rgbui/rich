import React, { ReactNode } from "react";
import { FieldConfig } from "../../../blocks/data-grid/schema/field";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { EventsComponent } from "../../../component/lib/events.component";
import { Col, Row } from "../../../component/view/grid";
import { Select } from "../../../component/view/select";
import { Remark } from "../../../component/view/text";
import { channel } from "../../../net/channel";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import "./style.less";
import { S } from "../../../i18n/view";
import { lst } from "../../../i18n/store";
import { LinkWs } from "../../../src/page/declare";

export class RollupView extends EventsComponent {
    render(): ReactNode {
        return <div className="shy-rollup-view">
            {this.notExistsRelationTable && <div><S>没有关联表，无法进行关联统计</S></div>}
            {this.notExistsRelationTable == false && this.relationDatas && <div>
                <Row>
                    <Col><Remark><S>关联表格</S>:</Remark></Col>
                    <Col><Select
                        value={this.config.rollupTableId}
                        options={this.relationDatas.map(r => { return { text: r.text, value: r.id } })}
                        onChange={e => { this.config.rollupTableId = e; this.loadTypeDatas() }}
                        style={{ width: '100%' }}
                    >
                    </Select>
                    </Col>
                </Row >
                {this.rollFields && <><Row>
                    <Col><Remark><S>统计表格列</S>:</Remark></Col>
                    <Col><Select value={this.config.rollupFieldId} options={this.rollFields.map(c => {
                        return { text: c.text, value: c.id }
                    })}
                        onChange={e => { this.config.rollupFieldId = e; this.loadTypeDatas() }}
                        style={{ width: '100%' }}></Select>
                    </Col>
                </Row >
                    {this.config.rollupFieldId && <Row>
                        <Col><Remark><S>对数据进行统计</S>:</Remark></Col>
                        <Col><Select onChange={e => this.config.rollupStatistic = e} value={this.config.rollupStatistic} options={this.rollupStatisticOptions} style={{ width: '100%' }}> </Select>
                        </Col>
                    </Row>}
                </>
                }
            </div>}
        </div>
    }
    isChange: boolean = false;
    private relationDatas: TableSchema[];
    config: FieldConfig = {};
    schema: TableSchema;
    private notExistsRelationTable: boolean = false;
    ws?:LinkWs
    async open(option: {
        schema: TableSchema,
        config?: Record<string, any>,
        ws?:LinkWs,
    }) {
        this.isChange = false;
        this.schema = option.schema;
        this.config = option.config || {};
        this.relationDatas = null;
        this.ws=option.ws;
        await this.loadTypeDatas();
        this.forceUpdate();
    }
    async loadTypeDatas(force?: boolean) {
        var isUpdate: boolean = false;
        if (!Array.isArray(this.relationDatas)) {
            var ids = this.schema.fields.findAll(g => g.config?.relationTableId ? true : false).map(g => g.config.relationTableId)
            if (ids.length > 0) {
                this.notExistsRelationTable = false;
                var r = await channel.get('/schema/ids/list', {
                    ids: ids,
                    ws:this.ws
                });
                if (r.ok) {
                    this.relationDatas = r.data.list as TableSchema[];
                    isUpdate = true;
                }
            }
            else this.notExistsRelationTable = true;
            isUpdate = true;
        }
        if (force == true && isUpdate) {
            this.forceUpdate()
        }
    }
    async onChangeConfig(config: Partial<FieldConfig>) {
        Object.assign(this.config, config);
        this.isChange = true;
        this.forceUpdate();
    }
    get rollupStatisticOptions() {
        var rfs = this.rollFields;
        if (rfs) {
            if (this.config.rollupFieldId) {
                var rf = rfs.find(g => g.id == this.config.rollupFieldId);
                if (rf.type == FieldType.number) {
                    return [
                        { text: lst('最小'), value: '$min' },
                        { text: lst('最大'), value: '$max' },
                        { text: lst('平均'), value: '$agv' },
                        { text: lst('求和'), value: '$sum' },
                    ]
                }
                else return [{ text: lst('数量'), value: '$count' }]
            }
        }
        return [];
    }
    get rollFields() {
        if (this.relationDatas)
            return this.relationDatas?.find(g => g.id == this.config?.rollupTableId)?.fields
    }
}

export async function useRollupView(pos: PopoverPosition,
    option: {
        schema: TableSchema,
        config?: Record<string, any>,
        ws?:LinkWs
    }) {
    let popover = await PopoverSingleton(RollupView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option);
    return new Promise((resolve: (data: { config?: FieldConfig }) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(fv.isChange ? { config: fv.config } : undefined);
        })
        popover.only('close', () => {
            resolve(fv.isChange ? { config: fv.config } : undefined);
        })
    })
}