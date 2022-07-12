import React from "react";
import { ReactNode } from "react";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { Switch } from "../../../../component/view/switch";
import "./style.less";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { TableStoreGallery } from "../../../../blocks/data-grid/view/gallery";
import lodash from "lodash";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { BlockRenderRange } from "../../../../src/block/enum";
import { SelectBox } from "../../../../component/view/select/box";
import { getTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { Divider } from "../../../../component/view/grid";

export class DataGridViewConfig extends EventsComponent {
    get schema() {
        return this.block?.schema;
    }
    block: DataGridView;
    onOpen(block: DataGridView) {
        this.block = block;
        this.forceUpdate();
    }
    render(): ReactNode {
        if (!this.block) return <div></div>;
        var fs = this.schema.fields.findAll(g => g.text ? true : false);
        var self = this;
        return <div className="shy-table-property-view">
            <div className="shy-table-property-view-item">
                <label>每页数量</label>
                <div className="operator"><SelectBox options={[
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
            </div>
            {this.block.url == BlockUrlConstant.DataGridGallery && <>
                <Divider></Divider>
                <div className="shy-table-property-view-item">
                    <label>列数</label>
                    <div className="operator"><SelectBox
                        options={[
                            { text: '1', value: 1 },
                            { text: '2', value: 2 },
                            { text: '3', value: 3 },
                            { text: '4', value: 4 },
                            { text: '5', value: 5 },
                            { text: '6', value: 6 }
                        ]}
                        value={(this.block as TableStoreGallery).gallerySize}
                        onChange={async e => { await this.block.onUpdateProps({ gallerySize: e }, { range: BlockRenderRange.self }); self.forceUpdate() }}></SelectBox></div>
                </div>
                <div className="shy-table-property-view-item">
                    <label>卡片是否自适应</label>
                    <div className="operator"><Switch onChange={async e => {
                        var g = lodash.cloneDeep((this.block as TableStoreGallery).cardConfig);
                        g.auto = e;
                        await this.block.onUpdateProps({ cardConfig: g }, { range: BlockRenderRange.self });
                        this.forceUpdate()
                    }} checked={(this.block as TableStoreGallery).cardConfig.auto}></Switch></div>
                </div>
                <Divider></Divider>
                <div className="shy-table-property-view-item">
                    <label>是否显示封面</label>
                    <div className="operator"><Switch onChange={async e => {
                        var g = lodash.cloneDeep((this.block as TableStoreGallery).cardConfig);
                        g.showCover = e;
                        await this.block.onUpdateProps({ cardConfig: g }, { range: BlockRenderRange.self });
                        this.forceUpdate();
                    }} checked={(this.block as TableStoreGallery).cardConfig.showCover}></Switch></div>
                </div>
                {(this.block as TableStoreGallery).cardConfig.showCover && <>
                    <div className="shy-table-property-view-item">
                        <label>封面自适应</label>
                        <div className="operator"><Switch onChange={async e => {
                            var g = lodash.cloneDeep((this.block as TableStoreGallery).cardConfig);
                            g.coverAuto = e;
                            await this.block.onUpdateProps({ cardConfig: g }, { range: BlockRenderRange.self });
                            this.forceUpdate();
                        }} checked={(this.block as TableStoreGallery).cardConfig.coverAuto}></Switch></div>
                    </div>
                    <div className="shy-table-property-view-item">
                        <label>封面字段</label>
                        <div className="operator"><SelectBox
                            options={fs.filter(g => g.type == FieldType.image).map(f => {
                                return {
                                    icon: getTypeSvg(f.type),
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
                        </SelectBox></div>
                    </div>
                </>}
            </>}
        </div>
    }
}