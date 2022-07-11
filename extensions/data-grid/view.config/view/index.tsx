import React from "react";
import { ReactNode } from "react";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { Switch } from "../../../../component/view/switch";
import "./style.less";
import { Remark } from "../../../../component/view/text";
import { Select } from "../../../../component/view/select";
import { Col, Row } from "../../../../component/view/grid";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { TableStoreGallery } from "../../../../blocks/data-grid/view/gallery";
import lodash from "lodash";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { BlockRenderRange } from "../../../../src/block/enum";
import { SelectBox } from "../../../../component/view/select/box";

export class DataGridViewConfig extends EventsComponent {
    get schema() {
        return this.block?.schema;
    }
    block: DataGridView;
    onOpen(block: DataGridView) {
        this.block = block;
        console.log('ggg', this.block);
        this.forceUpdate();
    }
    render(): ReactNode {
        if (!this.block) return <div></div>;
        var fs = this.schema.fields.findAll(g => g.text ? true : false);
        var self = this;
        return <div className="shy-table-property-view">
            <div className="shy-table-property-view-operator">
                <Remark>每页数量</Remark>
                <SelectBox options={[
                    { text: '20条', value: 20 },
                    { text: '50条', value: 50 },
                    { text: '80条', value: 80 },
                    { text: '100条', value: 100 },
                    { text: '150条', value: 150 },
                    { text: '200条', value: 200 }
                ]}
                    value={this.block.size}
                    onChange={e => { this.block.onChangeSize(e); self.forceUpdate() }}>
                </SelectBox>
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
                            { text: '1', value: 1 },
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
        </div>
    }
}