import React from "react";
import { ReactNode } from "react";
import { Field } from "../../../blocks/data-grid/schema/field";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { getTypeSvg } from "../../../blocks/data-grid/schema/util";
import { DataGridView } from "../../../blocks/data-grid/view/base/table";
import { EventsComponent } from "../../../component/lib/events.component";
import { Icon } from "../../../component/view/icon";
import { Switch } from "../../../component/view/switch";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import DragSvg from "../../../src/assert/svg/dragHandle.svg";
import "./style.less";
import { Remark } from "../../../component/view/text";
import { Select } from "../../../component/view/select";
import { Col, Divider, Row } from "../../../component/view/grid";
import PlusSvg from "../../../src/assert/svg/plus.svg";
import { BlockUrlConstant } from "../../../src/block/constant";
import { TableStoreGallery } from "../../../blocks/data-grid/view/gallery";
import lodash from "lodash";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { BlockRenderRange } from "../../../src/block/enum";

class TablePropertyView extends EventsComponent {
    schema: TableSchema;
    block: DataGridView;
    open(options: {
        schema: TableSchema,
        gridView: DataGridView
    }) {
        this.schema = options.schema;
        this.block = options.gridView;
        this.forceUpdate()
    }
    render(): ReactNode {
        if (!this.schema) return <div></div>
        var fs = this.schema.fields.findAll(g => g.text ? true : false);
        var self = this;
        async function change(field: Field, checked: boolean) {
            if (checked == true) {
                await self.block.onShowField(field);
            }
            else {
                var vf = self.block.fields.find(g => g.field.id == field.id);
                if (vf) await self.block.onHideField(vf);
            }
            self.forceUpdate();
        }
        function addField(event: React.MouseEvent) {
            self.block.onAddField(event);
        }
        return <div className="shy-table-property-view">
            <div className="shy-table-property-view-head"><span>当前视图设置</span></div>
            <Divider></Divider>
            <div className="shy-table-property-view-operator">
                <Remark>每页数量</Remark>
                <Select style={{ minWidth: 80, display: 'inline-flex', fontSize: 14, justifyContent: 'flex-end' }}
                    options={[
                        { text: '20条', value: 20 },
                        { text: '50条', value: 50 },
                        { text: '80条', value: 80 },
                        { text: '100条', value: 100 },
                        { text: '150条', value: 150 },
                        { text: '200条', value: 200 }
                    ]}
                    value={this.block.size}
                    onChange={e => { this.block.onChangeSize(e); self.forceUpdate() }}>
                </Select>
            </div>
            {this.block.url == BlockUrlConstant.DataGridGallery && <>
                <Row className="shy-table-property-view-operator">
                    <Col span={12} align={'start'}><Remark>列数</Remark></Col>
                    <Col span={12} align={'end'}><Select
                        style={{
                            minWidth: 80,
                            display: 'inline-flex',
                            fontSize: 14,
                            justifyContent: 'flex-end'
                        }}
                        options={[
                            { text: '2', value: 2 },
                            { text: '3', value: 3 },
                            { text: '4', value: 4 },
                            { text: '5', value: 5 },
                            { text: '6', value: 6 }
                        ]}
                        value={(this.block as TableStoreGallery).gallerySize}
                        onChange={async e => { await this.block.onUpdateProps({ gallerySize: e }, { range: BlockRenderRange.self }); self.forceUpdate() }}></Select>
                    </Col>
                </Row>
                <Row className="shy-table-property-view-operator">
                    <Col span={12} align={'start'}><Remark>卡片是否自适应</Remark></Col>
                    <Col span={12} align={'end'}><Switch onChange={async e => {
                        var g = lodash.cloneDeep((this.block as TableStoreGallery).cardConfig);
                        g.auto = e;
                        await this.block.onUpdateProps({ cardConfig: g }, { range: BlockRenderRange.self });
                        this.forceUpdate()
                    }} checked={(this.block as TableStoreGallery).cardConfig.auto}></Switch>
                    </Col>
                </Row>
                <Row className="shy-table-property-view-operator">
                    <Col span={12} align={'start'}><Remark>是否显示封面</Remark></Col>
                    <Col span={12} align={'end'}>
                        <Switch onChange={async e => {
                            var g = lodash.cloneDeep((this.block as TableStoreGallery).cardConfig);
                            g.showCover = e;
                            await this.block.onUpdateProps({ cardConfig: g }, { range: BlockRenderRange.self });
                            this.forceUpdate();
                        }} checked={(this.block as TableStoreGallery).cardConfig.showCover}></Switch>
                    </Col>
                </Row>
                {(this.block as TableStoreGallery).cardConfig.showCover && <>
                    <Row className="shy-table-property-view-operator">
                        <Col span={12} align={'start'}><Remark>封面自适应</Remark></Col>
                        <Col span={12} align={'end'}>
                            <Switch onChange={async e => {
                                var g = lodash.cloneDeep((this.block as TableStoreGallery).cardConfig);
                                g.coverAuto = e;
                                await this.block.onUpdateProps({ cardConfig: g }, { range: BlockRenderRange.self });
                                this.forceUpdate();
                            }} checked={(this.block as TableStoreGallery).cardConfig.coverAuto}></Switch>
                        </Col>
                    </Row>
                    <Row className="shy-table-property-view-operator">
                        <Col span={12} align={'start'}><Remark>封面字段</Remark></Col>
                        <Col span={12} align={'end'}>
                            <Select style={{ minWidth: 80, display: 'inline-flex', fontSize: 14, justifyContent: 'flex-end' }}
                                options={fs.filter(g => g.type == FieldType.image).map(f => {
                                    return {
                                        text: f.text,
                                        value: f.id
                                    }
                                })}
                                value={(this.block as TableStoreGallery).cardConfig.coverFieldId}
                                onChange={async e => {
                                    var g = lodash.cloneDeep((this.block as TableStoreGallery).cardConfig);
                                    g.coverFieldId = e;
                                    await this.block.onUpdateProps({ cardConfig: g }, { range: BlockRenderRange.self });
                                    self.forceUpdate()
                                }}>
                            </Select>
                        </Col>
                    </Row>
                </>}
            </>}
            <Divider></Divider>
            <div className="shy-table-property-view-operator">
                <Remark>所有字段</Remark>
                <a style={{ fontSize: '14px' }}>{this.block.fields.length == 0 ? "显示" : "隐蔽"}</a>
            </div>
            {fs.map(f => {
                return <div className="shy-table-property-view-item" key={f.id}>
                    <Icon size={14} style={{ padding: 10 }} wrapper className={'drag'} icon={DragSvg}></Icon>
                    <Icon size={14} icon={getTypeSvg(f.type)}></Icon>
                    <span>{f.text}</span>
                    <Switch onChange={e => change(f, e)} checked={this.block.fields.some(s => s.fieldId == f.id)}></Switch>
                </div>
            })}
            <Divider></Divider>
            <div className="shy-table-property-view-add">
                <a style={{
                    fontSize: 14,
                    display: 'inline-flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    cursor: 'pointer'
                }} onClick={e => addField(e)}><Icon size={14} style={{ marginRight: 5 }} icon={PlusSvg}></Icon>添加字段</a>
            </div>
        </div>
    }
}

export async function useTablePropertyView(pos: PopoverPosition,
    options: {
        schema: TableSchema,
        gridView: DataGridView
    }) {
    let popover = await PopoverSingleton(TablePropertyView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (config: Record<string, any>) => void, reject) => {
        popover.only('close', () => {
            resolve({})
        })
    })
}