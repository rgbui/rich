
import React from "react";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { DataGridView } from "../base";
import { DataGridTool } from "../components/tool";
import { CardConfig } from "../item/service";
import "./style.less";
import { Icon } from "../../../../component/view/icon";
import { S } from "../../../../i18n/view";
import { Spin, SpinBox } from "../../../../component/view/spin";
import { DataGridGroup } from "../components/group";
import { GalleryContent } from "./content";
import { Divider } from "../../../../component/view/grid";

@url('/data-grid/gallery')
export class TableStoreGallery extends DataGridView {
    @prop()
    gallerySize: number = 3;
    @prop()
    cardConfig: CardConfig = {
        auto: false,
        showCover: false,
        coverFieldId: "",
        showField: 'wrap',
        coverAuto: false,
        showMode: 'default',
        templateProps: {}
    };
    getCardUrl() {
        if (this.cardConfig?.showMode == 'define') {
            return this.cardConfig.templateProps.url;
        }
    }
    get isCardAuto() {
        return this.cardConfig?.auto || this.cardConfig?.showMode == 'define'
    }
}

@view('/data-grid/gallery')
export class TableStoreGalleryView extends BlockView<TableStoreGallery> {
    renderCreateTable() {
        if (this.block.isLoading) return <Spin block></Spin>
        return !this.block.schema && this.block.page.isCanEdit && <div className="item-hover item-hover-focus padding-5 cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            {this.block.willCreateSchema && <Spin></Spin>}
            <span className="size-24 flex-center remark"><Icon size={16} icon={{ name: 'byte', code: 'table' }}></Icon></span>
            <span className="remark"><S>添加或创建数据表</S></span>
        </div>
    }
    renderView() {
        return <div style={this.block.visibleStyle}><div style={this.block.contentStyle}>
            <div className='sy-data-grid-gallery'
                onMouseMove={e => this.block.onOver(true)}
                onMouseEnter={e => this.block.onOver(true)}
                onMouseLeave={e => this.block.onOver(false)}>
                <DataGridTool block={this.block}></DataGridTool>
                {!this.block.noTitle && <>
                    <Divider hidden={this.block.dataGridTab ? true : false}></Divider>
                    {!this.block.dataGridTab && <div className="padding-5"></div>}
                </>}
                {this.renderCreateTable()}
                <SpinBox spin={this.block.isLoadingData}>
                    <DataGridGroup
                        block={this.block}
                        renderRowContent={(b, c, g) => {
                            return <GalleryContent groupHead={g} block={b} childs={c}></GalleryContent>
                        }}></DataGridGroup>
                </SpinBox>
            </div>
        </div>
            {this.renderComment()}
        </div>
    }
}