import React from "react";
import { ReactNode } from "react";
import { FieldConfig } from "../../../blocks/data-grid/schema/field";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { Row, Col } from "../../../component/view/grid";
import { Select } from "../../../component/view/select";
import { Switch } from "../../../component/view/switch";
import { Remark } from "../../../component/view/text";
import { channel } from "../../../net/channel";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import "./style.less";

export class RelationView extends EventsComponent {
    render(): ReactNode {

        return <div className="shy-relation-view">
            {this.relationDatas && <Row>
                <Col><Remark>关联表格:</Remark></Col>
                <Col><Select
                    onChange={e => { this.config.relationTableId = e; this.isChange = true; this.forceUpdate() }}
                    value={this.config.relationTableId}
                    options={this.relationDatas.map(r => {
                        return {
                            text: r.text + (Array.isArray(r.views) && r.views.length > 0 ? r.views[0].text : ''),
                            value: r.id
                        }
                    })}
                    style={{ width: '100%' }}>
                </Select>
                </Col>
                <Col><Remark>是否一对多:</Remark><Switch onChange={e => this.onChangeConfig({ isMultiple: e })} checked={this.config?.isMultiple ? true : false}></Switch></Col>
            </Row >}
        </div>
    }
    isChange: boolean = false;
    private relationDatas: TableSchema[];
    config: FieldConfig = {};
    async open(option: { config?: FieldConfig }) {
        this.isChange = false;
        this.config = option.config || {};
        this.relationDatas = null;
        await this.loadTypeDatas();
        this.forceUpdate();
    }
    async loadTypeDatas(force?: boolean) {
        var isUpdate: boolean = false;
        if (!Array.isArray(this.relationDatas)) {
            var r = await channel.get('/schema/list');
            if (r.ok) {
                this.relationDatas = r.data.list as TableSchema[];
                isUpdate = true;
            }
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
}

export async function useRelationView(pos: PopoverPosition,
    option: {
        // type: FieldType,
        config?: Record<string, any>
    }) {
    let popover = await PopoverSingleton(RelationView, { mask: true });
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